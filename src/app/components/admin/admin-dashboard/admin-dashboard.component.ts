import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GuideService } from '../../../services/guide.service';
import { HttpClient } from '@angular/common/http';

export interface MapRegionNode {
  id?: string;
  name: string;
  code?: string;
  region?: string;
  x: number;
  y: number;
  lat: number;
  lng: number;
  v: number; // total access hits
  active?: number; // current live concurrent sessions
  software?: string; // e.g. Windent, Poliwin, Winodlab
  macroArea?: 'nord' | 'centro' | 'sud';
  labelDx?: number;
  labelDy?: number;
  textAnchor?: 'start' | 'middle' | 'end';
}

export interface RegionPath {
  name: string;
  macro: 'nord' | 'centro' | 'sud';
  d: string;
}

export interface LiveAccessEvent {
  id: string;
  region: string;
  clientName: string;
  software: string;
  action: string;
  time: string;
  color: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  isNotificationOpen = false;
  adminNotifications: any[] = [];
  accessStats: any = null;

  // Accurate SVG Paths for all 20 Italian Regions (High precision, normalized 480x580)
  readonly italyRegions: RegionPath[] = [
    {
        "name": "Piemonte",
        "macro": "nord",
        "d": "M53.4,102.5L52.4,100.3L55.1,96.8L52.1,94.3L53.3,91.6L56.3,93.7L65.5,88.5L73.9,90.0L79.7,88.1L81.0,81.9L78.5,78.9L78.9,70.4L82.8,69.3L84.3,64.7L88.3,62.6L85.9,57.1L98.5,47.7L98.4,57.6L107.8,64.6L108.3,67.8L102.8,73.7L102.3,79.6L105.7,82.4L107.7,91.4L112.2,97.2L107.9,97.9L109.4,99.2L107.0,101.9L102.2,98.7L100.3,101.9L102.3,104.3L101.2,106.3L103.2,106.1L101.9,107.4L105.9,114.6L113.7,112.7L120.1,123.9L125.0,126.9L124.7,134.0L122.3,135.1L115.2,130.4L113.6,132.1L114.8,135.7L111.6,135.7L110.3,139.0L107.8,134.8L95.5,140.2L91.9,137.2L90.3,143.0L85.2,147.8L86.3,153.6L82.4,155.3L83.4,156.9L75.0,155.2L73.6,158.9L71.9,153.5L63.3,156.4L58.3,155.1L49.0,150.8L44.8,144.9L46.9,141.8L43.7,137.0L47.6,133.0L47.4,130.4L51.3,129.8L49.5,123.6L40.1,119.8L39.9,114.8L37.3,114.3L35.8,110.6L40.7,108.0L45.0,109.1L53.4,102.5Z"
    },
    {
        "name": "Valle d'Aosta",
        "macro": "nord",
        "d": "M74.0,72.7L78.5,73.0L81.1,85.7L73.9,90.0L65.5,88.5L56.3,93.7L53.4,91.6L50.3,93.6L48.3,90.9L48.6,85.8L41.9,80.5L42.4,76.9L49.8,72.8L55.2,75.7L68.3,69.7L74.0,72.7Z"
    },
    {
        "name": "Liguria",
        "macro": "nord",
        "d": "M67.7,166.6L74.8,157.8L73.8,155.8L83.3,156.9L82.6,155.1L85.6,154.9L85.2,147.8L90.3,143.0L90.9,137.8L95.5,140.2L97.5,138.0L103.0,138.1L104.6,134.6L108.0,134.9L110.3,139.0L111.6,135.7L114.8,135.7L113.6,132.1L115.2,130.4L122.4,135.1L126.1,133.0L134.5,135.8L132.7,142.3L140.2,142.6L147.0,149.2L147.4,153.3L148.9,152.0L148.4,154.0L151.2,153.9L151.6,157.2L154.5,157.4L151.3,160.0L146.4,156.6L146.3,159.4L125.7,145.6L125.1,147.9L121.0,144.5L108.8,141.9L98.7,148.4L97.8,152.7L92.4,155.2L89.1,163.8L85.6,166.7L71.9,172.0L67.0,171.6L65.7,168.0L67.7,166.6ZM115.2,143.5L113.4,143.0L115.2,143.5ZM113.2,143.0L111.3,142.5L113.2,143.0Z"
    },
    {
        "name": "Lombardia",
        "macro": "nord",
        "d": "M103.1,80.7L102.8,73.7L108.2,68.4L108.7,63.5L112.5,65.7L110.2,69.7L114.0,71.1L114.6,77.0L118.8,77.4L120.7,73.8L117.2,70.5L117.9,67.5L126.2,58.4L128.0,54.1L126.1,49.0L127.4,46.2L131.8,47.6L133.5,45.7L133.5,51.8L136.6,55.2L141.9,55.7L143.0,53.0L150.5,51.6L153.7,58.6L156.4,58.8L158.2,57.3L155.7,53.9L157.8,50.4L153.5,48.6L153.6,44.3L155.6,40.9L160.4,39.8L162.3,43.7L166.5,43.7L173.5,48.5L173.0,51.6L170.0,52.8L172.3,57.9L167.7,69.7L170.5,79.0L181.1,76.9L173.8,87.6L173.6,94.9L176.9,96.7L175.8,99.6L184.4,104.7L189.1,110.9L193.6,110.3L192.6,112.6L201.3,117.7L189.1,117.2L182.8,119.5L177.2,115.8L170.0,119.5L166.1,116.1L153.8,113.5L151.6,109.3L148.0,109.6L148.5,111.7L146.0,113.0L143.7,110.2L142.3,112.7L136.5,109.3L136.0,111.8L131.8,111.6L127.4,118.6L130.1,123.6L127.4,126.2L128.8,129.8L124.5,129.9L125.0,126.9L120.1,123.9L113.7,112.7L105.9,114.6L101.9,107.4L103.2,106.1L101.2,106.3L102.3,104.3L100.3,101.9L102.2,98.7L107.0,101.9L109.4,99.2L107.9,97.9L112.2,97.2L107.7,91.4L106.6,84.1L103.1,80.7Z"
    },
    {
        "name": "Trentino-Alto Adige",
        "macro": "nord",
        "d": "M221.5,43.7L215.1,45.6L217.2,48.8L213.3,52.6L218.6,57.7L219.3,61.3L210.2,64.9L209.9,70.8L204.2,68.6L199.4,69.9L198.6,73.4L195.5,72.8L191.1,83.4L183.9,84.0L181.2,82.2L182.7,77.9L180.6,76.7L171.2,79.2L169.4,77.0L167.7,69.6L172.3,57.7L169.9,53.2L173.8,50.6L172.8,47.5L167.9,45.6L169.1,40.7L165.6,38.9L168.4,29.6L175.1,28.7L178.4,31.1L177.3,32.7L187.3,33.8L192.3,24.5L208.1,22.4L212.3,24.4L227.5,18.7L229.3,19.8L225.2,22.6L226.0,26.9L230.5,28.3L230.8,33.0L237.5,37.7L227.7,41.7L223.4,38.0L221.5,43.7Z"
    },
    {
        "name": "Veneto",
        "macro": "nord",
        "d": "M174.0,90.7L173.8,87.2L181.1,76.9L182.7,77.9L181.2,82.2L184.4,84.3L187.0,82.3L190.9,83.5L195.5,72.8L198.6,73.4L199.4,69.9L204.2,68.6L209.9,70.8L210.2,64.9L217.3,63.6L219.7,60.0L213.3,52.6L217.2,48.8L214.5,46.8L221.0,44.5L223.4,38.0L227.7,41.7L237.5,37.7L246.3,39.9L242.4,44.0L243.9,47.5L239.3,47.7L232.2,56.6L238.1,62.2L234.8,67.3L235.7,71.6L244.1,78.9L247.9,75.9L254.2,76.3L259.0,85.8L233.5,97.1L231.3,104.1L232.6,111.3L240.2,117.0L234.8,125.0L231.2,121.9L230.8,118.1L222.7,116.5L214.3,116.5L207.9,120.6L201.3,118.7L195.7,112.8L192.6,112.6L193.6,110.3L189.1,110.9L184.4,104.7L179.1,100.8L177.2,102.0L175.7,99.1L176.8,96.2L173.6,94.9L174.0,90.7Z"
    },
    {
        "name": "Friuli-Venezia Giulia",
        "macro": "nord",
        "d": "M273.3,51.5L268.5,55.4L269.7,59.4L278.4,61.3L271.9,68.9L277.6,69.9L275.3,76.4L287.2,86.1L284.4,88.5L280.4,87.9L283.3,87.4L281.5,84.0L273.9,78.2L274.6,81.9L270.5,84.0L264.0,82.2L259.0,85.7L254.2,76.3L247.9,75.9L244.1,78.9L240.3,77.2L234.8,67.3L238.1,62.2L232.1,56.9L239.3,47.7L243.9,47.5L242.7,43.3L247.3,39.2L280.1,45.0L279.3,48.8L273.3,51.5Z"
    },
    {
        "name": "Emilia-Romagna",
        "macro": "nord",
        "d": "M129.1,127.7L127.4,126.2L130.1,123.6L127.4,118.6L131.8,111.6L136.0,111.8L136.5,109.3L142.3,112.7L143.7,110.2L146.0,113.0L148.5,111.7L148.0,109.6L151.6,109.3L155.3,114.3L159.4,113.9L171.6,119.7L177.2,115.8L182.8,119.5L197.7,117.2L207.8,120.6L214.4,116.5L230.6,118.0L231.2,121.9L234.8,125.0L230.9,122.8L229.3,128.8L233.4,149.2L246.9,163.1L246.3,167.7L242.6,169.9L241.4,167.0L238.1,167.2L238.5,162.1L235.0,163.7L237.0,166.8L230.8,172.5L220.6,172.7L211.0,167.3L208.8,162.1L212.4,155.9L206.7,156.5L207.8,154.4L204.4,154.4L201.1,150.6L193.3,154.7L195.0,157.2L188.3,157.5L186.8,155.3L183.5,158.8L174.3,154.3L172.5,156.3L168.8,151.4L152.4,143.6L151.1,140.2L145.9,140.1L140.9,144.8L138.4,141.5L132.7,142.3L134.5,135.8L124.5,133.2L124.5,129.9L128.8,129.8L129.1,127.7Z"
    },
    {
        "name": "Marche",
        "macro": "centro",
        "d": "M238.3,183.9L232.5,183.7L233.8,179.7L230.0,180.7L227.6,178.6L231.7,174.1L231.9,176.6L233.8,175.1L230.8,171.2L237.2,166.5L244.3,169.8L246.9,163.1L252.3,165.2L265.4,176.5L277.1,182.5L287.1,212.8L278.4,216.8L273.9,216.4L269.0,222.4L262.0,220.2L264.6,216.8L263.6,214.1L261.1,215.7L257.3,211.6L254.7,213.9L254.7,211.3L251.9,209.6L252.0,203.6L249.8,201.5L250.8,198.2L246.8,189.9L247.7,186.8L242.4,188.7L238.3,183.9Z"
    },
    {
        "name": "Toscana",
        "macro": "centro",
        "d": "M148.6,154.1L149.8,152.6L147.4,153.3L147.0,149.2L141.3,144.7L147.1,139.9L151.1,140.2L152.2,143.4L160.8,149.3L168.8,151.4L172.5,156.3L178.0,154.5L183.3,158.7L186.8,155.3L188.3,157.5L195.1,157.1L193.3,154.7L201.1,150.6L204.4,154.4L207.8,154.4L206.7,156.5L212.5,156.1L208.8,162.1L211.8,168.0L223.5,173.7L230.8,172.5L233.8,175.1L231.9,176.6L231.7,174.1L227.4,178.2L228.4,179.7L224.2,184.3L226.0,186.2L221.9,188.7L225.3,191.4L225.6,194.4L228.8,194.2L222.5,196.3L221.8,199.3L218.5,201.0L218.4,204.4L220.4,205.6L219.6,213.9L212.5,217.1L214.8,219.7L214.5,224.0L206.5,227.9L207.9,234.0L203.4,233.8L202.1,236.7L194.9,234.8L191.8,237.5L189.6,234.4L192.5,233.6L192.7,229.3L184.9,220.1L177.3,217.1L178.8,212.1L169.2,211.1L170.2,196.8L162.2,182.6L160.3,167.6L152.7,159.6L154.4,157.0L148.6,154.1ZM154.8,225.5L155.5,227.6L153.8,227.6L154.8,225.5ZM161.2,219.7L156.7,220.2L156.4,217.0L164.0,217.3L166.3,213.8L167.3,214.9L165.4,219.0L167.0,221.2L161.2,219.7ZM146.1,204.6L145.6,207.8L146.1,204.6ZM162.9,237.9L162.2,239.5L162.9,237.9ZM228.8,170.5L227.9,172.3L226.9,170.7L228.8,170.5ZM182.7,236.2L183.8,239.4L182.7,236.2Z"
    },
    {
        "name": "Umbria",
        "macro": "centro",
        "d": "M261.0,223.9L251.4,226.0L251.8,228.1L244.2,233.7L242.4,232.5L239.2,237.3L235.3,234.5L235.6,231.4L231.0,231.3L228.1,223.6L219.0,222.6L220.3,218.8L217.3,215.2L219.6,213.9L220.4,205.6L218.0,202.0L222.2,196.5L228.8,194.2L225.6,194.4L225.3,191.3L222.1,189.3L226.0,186.2L224.3,183.8L228.4,179.7L233.3,179.4L232.5,183.7L237.7,183.5L242.4,188.7L247.7,186.8L246.8,189.9L250.8,198.2L249.8,201.5L252.0,203.6L251.9,209.6L254.7,211.3L254.7,213.9L257.4,211.6L260.8,215.5L264.1,214.9L261.0,223.9Z"
    },
    {
        "name": "Lazio",
        "macro": "centro",
        "d": "M214.5,216.8L217.7,215.7L220.3,218.8L218.5,221.6L222.1,224.4L228.1,223.6L231.0,231.3L235.6,231.4L235.3,234.5L239.2,237.3L242.4,232.5L244.2,233.7L251.8,228.1L251.7,225.8L260.6,224.2L262.0,220.2L266.5,220.7L269.6,224.4L269.1,226.8L262.1,227.0L261.7,232.0L259.5,233.6L262.2,236.2L260.8,237.7L268.6,245.8L264.1,248.3L258.5,245.9L256.4,251.8L268.1,257.6L268.6,262.6L275.2,265.5L280.7,263.5L287.2,267.2L290.9,276.2L285.2,281.1L286.2,286.6L281.8,290.1L276.8,288.4L275.3,291.0L265.5,286.7L257.5,290.0L252.1,282.3L242.3,279.8L236.2,270.9L228.7,266.0L225.9,258.1L218.1,252.3L215.3,252.8L209.4,241.7L202.1,236.7L203.4,233.8L207.9,234.0L206.5,227.9L214.3,224.4L214.8,219.7L212.3,217.8L214.5,216.8ZM254.4,304.0L253.9,306.1L254.4,304.0Z"
    },
    {
        "name": "Campania",
        "macro": "sud",
        "d": "M293.0,279.1L294.2,277.0L298.3,277.4L310.8,283.6L324.7,277.9L327.9,280.5L327.0,285.0L334.1,289.2L331.7,293.5L343.4,298.0L342.6,304.7L336.7,305.8L337.5,308.0L336.0,308.0L337.6,313.2L341.8,316.0L340.0,318.5L343.1,320.4L343.0,324.1L352.3,334.0L347.8,344.1L342.5,343.3L338.9,347.1L333.8,345.6L333.8,343.2L329.0,338.7L321.4,335.4L324.4,328.7L317.3,316.0L301.2,320.3L306.5,314.5L305.5,311.8L299.3,307.7L291.3,310.0L290.5,303.7L281.8,290.1L286.2,286.6L285.3,281.0L289.1,279.0L293.8,282.5L293.0,279.1ZM298.0,321.6L299.2,320.9L298.0,321.6ZM288.4,313.9L285.6,314.4L285.2,311.6L288.4,313.9ZM290.6,311.2L289.6,312.3L290.6,311.2Z"
    },
    {
        "name": "Abruzzo",
        "macro": "sud",
        "d": "M288.0,268.6L280.7,263.5L275.2,265.5L268.6,262.6L268.1,257.7L257.4,253.4L256.2,250.7L258.5,245.9L264.1,248.3L268.6,245.8L260.8,237.7L262.2,236.2L259.5,233.6L261.7,232.0L262.1,227.0L268.7,227.3L269.6,224.6L267.9,222.0L272.5,220.1L273.9,216.4L278.4,216.8L286.8,212.8L293.8,228.1L307.6,242.5L314.6,246.0L317.0,252.6L306.9,265.2L305.2,261.5L299.8,258.3L295.1,262.1L296.7,265.8L288.0,268.6Z"
    },
    {
        "name": "Molise",
        "macro": "sud",
        "d": "M304.4,280.3L294.2,277.0L292.7,279.7L293.8,282.5L289.2,279.0L290.9,274.7L288.0,268.6L296.7,265.8L295.4,261.7L299.8,258.3L305.2,261.5L306.8,265.2L316.8,250.9L329.2,257.5L327.9,265.0L330.0,267.6L322.2,271.8L322.3,276.0L324.7,277.9L310.8,283.6L304.4,280.3Z"
    },
    {
        "name": "Puglia",
        "macro": "sud",
        "d": "M327.9,282.3L322.3,276.1L322.2,271.8L330.0,267.6L327.9,265.0L329.2,257.6L361.9,256.9L365.3,259.5L365.7,263.6L355.6,271.9L357.5,279.1L396.5,297.5L409.9,308.3L425.7,314.9L427.1,316.0L425.4,317.1L428.4,317.0L430.7,322.4L442.5,333.2L445.8,341.7L442.0,347.7L440.6,356.2L434.9,354.1L428.3,348.1L427.0,344.1L428.2,341.6L423.1,333.5L410.9,333.0L400.5,327.8L402.0,325.4L397.3,322.6L388.6,328.2L383.8,324.5L383.9,313.6L381.8,312.0L376.2,311.4L372.7,313.9L365.9,304.2L358.1,302.3L360.3,298.8L354.5,293.9L343.2,297.8L334.2,295.9L331.6,293.2L334.1,289.2L327.0,285.0L327.9,282.3Z"
    },
    {
        "name": "Basilicata",
        "macro": "sud",
        "d": "M340.5,317.3L341.8,316.0L337.6,313.2L336.7,305.8L342.6,304.7L343.8,296.3L351.0,296.6L354.5,293.9L360.3,298.8L358.1,302.3L365.9,304.2L372.7,313.9L376.2,311.4L383.9,313.6L383.8,324.5L388.8,328.3L381.2,341.2L373.5,340.0L371.1,351.3L368.1,349.7L360.6,351.5L360.0,347.0L353.7,346.4L350.5,350.2L346.7,344.7L352.3,334.0L343.0,324.1L343.1,320.4L340.5,317.3Z"
    },
    {
        "name": "Calabria",
        "macro": "sud",
        "d": "M358.0,371.3L352.6,361.5L351.1,348.4L359.6,346.8L360.6,351.5L368.1,349.7L371.0,351.3L373.5,340.0L380.5,340.6L380.6,348.6L375.8,356.1L376.8,362.0L385.5,364.2L398.8,374.3L397.1,387.9L400.5,391.6L396.7,397.9L391.7,395.8L380.1,401.2L377.4,406.2L378.4,419.7L369.9,425.8L364.6,432.9L361.2,442.6L350.8,443.0L346.4,438.9L346.3,428.9L351.8,426.2L355.8,418.6L356.5,413.9L353.3,409.3L358.5,405.7L363.7,405.9L366.5,400.3L366.4,396.4L362.4,391.5L358.0,371.3Z"
    },
    {
        "name": "Sicilia",
        "macro": "sud",
        "d": "M252.3,438.0L258.2,435.1L257.3,432.8L259.1,430.3L266.4,428.8L268.8,434.1L274.1,433.9L275.0,437.3L281.2,440.5L290.8,437.2L308.0,437.2L315.8,431.5L321.5,430.3L327.8,433.5L331.7,430.6L332.2,426.6L334.6,429.6L343.1,425.2L347.0,426.8L344.5,427.8L331.8,450.4L330.6,458.7L327.4,463.1L327.9,470.7L333.3,474.2L330.8,476.3L336.1,485.1L329.8,489.3L327.8,494.8L329.2,500.1L327.2,501.7L325.1,499.2L316.9,499.1L307.0,495.3L298.9,482.7L281.4,478.5L261.3,462.6L256.2,462.5L252.7,458.7L243.9,459.2L237.4,453.1L235.7,448.3L237.8,445.0L238.0,438.4L245.5,434.1L246.3,430.4L252.3,438.0ZM231.7,441.2L233.7,443.5L230.7,442.9L231.7,441.2ZM223.2,439.5L224.2,441.6L223.2,439.5ZM232.6,438.2L232.7,439.8L232.6,438.2ZM236.7,443.5L236.4,446.4L236.7,443.5ZM219.5,492.8L222.6,494.6L222.7,497.0L220.4,497.2L218.5,494.5L219.5,492.8ZM261.7,405.8L260.8,407.1L261.7,405.8ZM319.2,414.3L317.8,412.2L320.1,412.3L319.2,414.3ZM323.1,419.1L324.5,422.0L323.1,419.1ZM323.1,414.9L322.8,418.8L321.0,416.4L323.1,414.9ZM309.1,412.0L310.4,413.4L309.1,412.0ZM332.1,401.6L331.0,402.8L332.1,401.6ZM239.7,553.4L242.8,555.0L239.7,553.4Z"
    },
    {
        "name": "Sardegna",
        "macro": "sud",
        "d": "M95.8,323.7L93.3,319.2L88.3,319.6L90.2,315.2L87.7,312.8L90.7,306.4L90.1,301.7L93.5,307.3L100.2,308.7L110.4,304.0L118.0,294.7L123.1,293.0L122.6,289.0L130.1,290.8L132.8,295.6L135.6,293.2L137.2,295.1L135.0,300.0L140.5,300.7L134.9,304.4L139.8,304.1L138.9,305.5L142.7,307.7L140.8,310.4L146.2,322.2L139.1,335.0L143.0,343.1L138.2,376.6L139.5,379.1L135.7,388.5L125.0,382.4L119.0,384.9L118.5,392.9L112.6,398.6L108.0,395.8L105.2,399.1L101.4,390.2L99.3,390.3L97.1,394.7L95.2,388.4L100.0,389.0L95.8,382.9L98.2,379.5L96.3,371.8L99.4,365.2L98.4,357.8L100.5,359.9L102.8,353.0L100.1,350.8L98.2,353.2L96.9,351.1L96.1,345.0L100.1,342.6L99.8,334.0L96.3,331.0L95.8,323.7ZM94.1,294.8L94.8,297.6L90.4,301.0L94.1,294.8ZM133.9,289.1L133.8,292.6L133.9,289.1ZM132.1,288.0L132.8,290.4L130.8,290.7L132.1,288.0ZM143.0,303.9L140.8,305.5L143.0,303.9ZM93.8,384.2L93.7,388.1L91.7,387.9L91.0,385.5L93.8,384.2Z"
    }
];

  // Pre-calculated region coordinates & collision-free label placements for 480x580 viewport
  readonly regionDefaultPositions: Record<string, { x: number; y: number; labelDx: number; labelDy: number; textAnchor: 'start' | 'middle' | 'end' }> = {
    'Valle d\'Aosta': { x: 60.0, y: 82.0, labelDx: -10, labelDy: -6, textAnchor: 'end' },
    'Piemonte': { x: 72.3, y: 112.2, labelDx: -10, labelDy: 4, textAnchor: 'end' },
    'Liguria': { x: 105.0, y: 152.0, labelDx: -10, labelDy: 12, textAnchor: 'end' },
    'Lombardia': { x: 138.0, y: 92.0, labelDx: 0, labelDy: -10, textAnchor: 'middle' },
    'Trentino-Alto Adige': { x: 202.0, y: 54.0, labelDx: 10, labelDy: -6, textAnchor: 'start' },
    'Veneto': { x: 215.0, y: 92.0, labelDx: 10, labelDy: 2, textAnchor: 'start' },
    'Friuli-Venezia Giulia': { x: 262.0, y: 68.0, labelDx: 10, labelDy: 3, textAnchor: 'start' },
    'Emilia-Romagna': { x: 188.0, y: 142.0, labelDx: 10, labelDy: 4, textAnchor: 'start' },
    'Toscana': { x: 188.0, y: 188.0, labelDx: -10, labelDy: 4, textAnchor: 'end' },
    'Umbria': { x: 238.0, y: 208.0, labelDx: -10, labelDy: -6, textAnchor: 'end' },
    'Marche': { x: 260.0, y: 190.0, labelDx: 10, labelDy: 3, textAnchor: 'start' },
    'Lazio': { x: 245.0, y: 260.0, labelDx: -12, labelDy: 4, textAnchor: 'end' },
    'Abruzzo': { x: 288.0, y: 242.0, labelDx: 10, labelDy: 3, textAnchor: 'start' },
    'Molise': { x: 310.0, y: 268.0, labelDx: 10, labelDy: 3, textAnchor: 'start' },
    'Campania': { x: 312.0, y: 312.0, labelDx: -10, labelDy: 4, textAnchor: 'end' },
    'Puglia': { x: 382.0, y: 305.0, labelDx: 10, labelDy: 3, textAnchor: 'start' },
    'Basilicata': { x: 360.0, y: 330.0, labelDx: -10, labelDy: 8, textAnchor: 'end' },
    'Calabria': { x: 370.0, y: 395.0, labelDx: 10, labelDy: 4, textAnchor: 'start' },
    'Sicilia': { x: 285.0, y: 460.0, labelDx: 0, labelDy: -10, textAnchor: 'middle' },
    'Sardegna': { x: 115.0, y: 345.0, labelDx: 12, labelDy: 3, textAnchor: 'start' }
  };

  // Interactive Map State
  selectedMacroRegion: 'all' | 'nord' | 'centro' | 'sud' = 'all';
  hoveredNode: MapRegionNode | null = null;
  activePingNode: MapRegionNode | null = null;
  hoveredRegion: string | null = null;

  // Real-time live access log
  liveFeed: LiveAccessEvent[] = [];
  private feedInterval: any;
  private pingInterval: any;
  private pollInterval: any;

  constructor(private guideService: GuideService, private http: HttpClient) {}

  ngOnInit() {
    this.adminNotifications = [
      { message: 'Nuovo backup generato con successo', time: '10 min fa', icon: 'fallback' }
    ];
    this.loadAccessStats();
    this.initLiveFeed();

    // Aggiorna periodicamente le statistiche dal server
    this.pollInterval = setInterval(() => this.loadAccessStats(), 25000);
  }

  ngOnDestroy() {
    if (this.feedInterval) clearInterval(this.feedInterval);
    if (this.pingInterval) clearInterval(this.pingInterval);
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  get guideStats() {
    const cats = this.guideService.categories;
    let guides = 0, faqs = 0, published = 0, drafts = 0, maxFaqs = 0;
    const perCategory = cats.map(c => {
      const gf = c.manuals.reduce((n, g) => n + g.faqs.length, 0);
      guides += c.manuals.length;
      faqs += gf;
      c.manuals.forEach(g => g.status === 'pub' ? published++ : drafts++);
      if (gf > maxFaqs) maxFaqs = gf;
      return { name: c.name, accent: c.accent, guides: c.manuals.length, faqs: gf };
    });
    return { categories: cats.length, guides, faqs, published, drafts, maxFaqs: maxFaqs || 1, perCategory };
  }

  get publishGradient(): string {
    const s = this.guideStats;
    const total = (s.published + s.drafts) || 1;
    const p = (s.published / total) * 100;
    return `conic-gradient(#12B76A ${p}%, #F79009 ${p}%)`;
  }

  get draftGuides(): { category: string; title: string }[] {
    const out: { category: string; title: string }[] = [];
    this.guideService.categories.forEach(c => c.manuals.forEach(g => {
      if (g.status === 'draft') out.push({ category: c.name, title: g.title });
    }));
    return out;
  }

  private loadAccessStats() {
    this.http.get<any>('/api/get_access_stats.ashx').subscribe({
      next: (d) => {
        if (d && Array.isArray(d.mapNodes) && d.mapNodes.length > 0) {
          this.accessStats = d;
        } else {
          this.seedDefaultNodes();
        }
      },
      error: () => {
        if (!this.accessStats) this.seedDefaultNodes();
      }
    });
  }

  private seedDefaultNodes() {
    this.accessStats = {
      heatmap: [],
      mapNodes: [
        { id: "lom", name: "Lombardia", code: "LOM", macroArea: "nord", x: 138.0, y: 92.0, lat: 45.46, lng: 9.19, v: 168, active: 9, software: "Windent" },
        { id: "laz", name: "Lazio", code: "LAZ", macroArea: "centro", x: 245.0, y: 260.0, lat: 41.90, lng: 12.50, v: 189, active: 11, software: "Poliwin" },
        { id: "cam", name: "Campania", code: "CAM", macroArea: "sud", x: 312.0, y: 312.0, lat: 40.85, lng: 14.27, v: 125, active: 7, software: "Poliwin" },
        { id: "ven", name: "Veneto", code: "VEN", macroArea: "nord", x: 215.0, y: 92.0, lat: 45.44, lng: 12.32, v: 116, active: 6, software: "Winodlab" },
        { id: "emr", name: "Emilia-Romagna", code: "EMR", macroArea: "nord", x: 188.0, y: 142.0, lat: 44.49, lng: 11.34, v: 96, active: 6, software: "Winodlab" },
        { id: "pug", name: "Puglia", code: "PUG", macroArea: "sud", x: 382.0, y: 305.0, lat: 41.12, lng: 16.87, v: 92, active: 5, software: "Poliwin" },
        { id: "sic", name: "Sicilia", code: "SIC", macroArea: "sud", x: 285.0, y: 460.0, lat: 37.50, lng: 14.20, v: 85, active: 4, software: "Poliwin" },
        { id: "tos", name: "Toscana", code: "TOS", macroArea: "centro", x: 188.0, y: 188.0, lat: 43.77, lng: 11.25, v: 84, active: 5, software: "Windent" },
        { id: "pie", name: "Piemonte", code: "PIE", macroArea: "nord", x: 72.3, y: 112.2, lat: 45.07, lng: 7.68, v: 78, active: 4, software: "Windent" },
        { id: "sar", name: "Sardegna", code: "SAR", macroArea: "sud", x: 115.0, y: 345.0, lat: 40.12, lng: 9.01, v: 54, active: 3, software: "Windent" },
        { id: "lig", "name": "Liguria", code: "LIG", macroArea: "nord", x: 105.0, y: 152.0, lat: 44.41, lng: 8.93, v: 45, active: 2, software: "Windent" },
        { id: "mar", name: "Marche", code: "MAR", macroArea: "centro", x: 260.0, y: 190.0, lat: 43.61, lng: 13.51, v: 42, active: 2, software: "Windent" },
        { id: "cal", name: "Calabria", code: "CAL", macroArea: "sud", x: 370.0, y: 395.0, lat: 38.91, lng: 16.59, v: 38, active: 2, software: "Poliwin" },
        { id: "taa", name: "Trentino-Alto Adige", code: "TAA", macroArea: "nord", x: 202.0, y: 54.0, lat: 46.06, lng: 11.12, v: 36, active: 2, software: "Winodlab" },
        { id: "fvg", name: "Friuli-Venezia Giulia", code: "FVG", macroArea: "nord", x: 262.0, y: 68.0, lat: 45.65, lng: 13.77, v: 35, active: 2, software: "Windent" },
        { id: "abr", name: "Abruzzo", code: "ABR", macroArea: "sud", x: 288.0, y: 242.0, lat: 42.35, lng: 13.40, v: 34, active: 2, software: "Poliwin" },
        { id: "umb", name: "Umbria", code: "UMB", macroArea: "centro", x: 238.0, y: 208.0, lat: 43.11, lng: 12.39, v: 31, active: 1, software: "Windent" },
        { id: "bas", name: "Basilicata", code: "BAS", macroArea: "sud", x: 360.0, y: 330.0, lat: 40.64, lng: 15.80, v: 22, active: 1, software: "Poliwin" },
        { id: "mol", name: "Molise", code: "MOL", macroArea: "sud", x: 310.0, y: 268.0, lat: 41.56, lng: 14.66, v: 19, active: 1, software: "Poliwin" },
        { id: "vda", name: "Valle d'Aosta", code: "VDA", macroArea: "nord", x: 60.0, y: 82.0, lat: 45.73, lng: 7.32, v: 18, active: 1, software: "Windent" }
      ]
    };
  }

  // ---- Mappa e Nodi Regionali ----
  get accessMapNodes(): MapRegionNode[] {
    const raw: any[] = (this.accessStats && Array.isArray(this.accessStats.mapNodes)) ? this.accessStats.mapNodes : [];
    return raw.map(n => {
      const regionName = n.name || n.region || 'Italia';
      const def = this.regionDefaultPositions[regionName] || { x: n.x || 200, y: n.y || 200, labelDx: 8, labelDy: 3, textAnchor: 'start' };
      const lat = Number(n.lat) || 0;
      let macro: 'nord' | 'centro' | 'sud' = n.macroArea || 'centro';
      if (!n.macroArea && lat > 0) {
        if (lat >= 43.9) macro = 'nord';
        else if (lat >= 41.5) macro = 'centro';
        else macro = 'sud';
      }

      return {
        id: n.id,
        name: regionName,
        code: n.code,
        region: regionName,
        x: def.x,
        y: def.y,
        lat: n.lat,
        lng: n.lng,
        v: n.v || 0,
        active: n.active !== undefined ? n.active : Math.max(1, Math.round((n.v || 1) / 15)),
        software: n.software || (['Lazio', 'Campania', 'Puglia', 'Sicilia', 'Calabria', 'Basilicata', 'Abruzzo', 'Molise'].includes(regionName) ? 'Poliwin' : ['Emilia-Romagna', 'Veneto', 'Trentino-Alto Adige'].includes(regionName) ? 'Winodlab' : 'Windent'),
        macroArea: macro,
        labelDx: def.labelDx,
        labelDy: def.labelDy,
        textAnchor: def.textAnchor
      };
    });
  }

  get filteredMapNodes(): MapRegionNode[] {
    if (this.selectedMacroRegion === 'all') return this.accessMapNodes;
    return this.accessMapNodes.filter(n => n.macroArea === this.selectedMacroRegion);
  }

  get accessMapNodesSorted(): MapRegionNode[] {
    return [...this.filteredMapNodes].sort((a, b) => b.v - a.v);
  }

  get accessMapMax(): number {
    return Math.max(1, ...this.accessMapNodes.map(n => n.v));
  }

  get totalAccessHits(): number {
    return this.accessMapNodes.reduce((sum, n) => sum + (n.v || 0), 0);
  }

  get totalActiveConnections(): number {
    return this.accessMapNodes.reduce((sum, n) => sum + (n.active || 0), 0);
  }

  get topRegion(): MapRegionNode | null {
    if (!this.accessMapNodes.length) return null;
    return [...this.accessMapNodes].sort((a, b) => b.v - a.v)[0];
  }

  // Retrocompatibilità
  get topCity(): MapRegionNode | null {
    return this.topRegion;
  }

  // ---- Simulazione Live Stream / Real-time Ping ----
  private initLiveFeed() {
    const clients = [
      { name: 'Studio Dentistico DentalCare', region: 'Lombardia', software: 'Windent', action: 'Apertura cartella clinica', color: '#377DFF' },
      { name: 'Poliambulatorio San Marco', region: 'Lazio', software: 'Poliwin', action: 'Gestione agenda appuntamenti', color: '#F80086' },
      { name: 'Lab Odontotecnico F.lli Rossi', region: 'Emilia-Romagna', software: 'Winodlab', action: 'Invio lavorazione CAD/CAM', color: '#F97316' },
      { name: 'Centro Medico Partenopeo', region: 'Campania', software: 'Poliwin', action: 'Consultazione guida fatturazione', color: '#F80086' },
      { name: 'Studio Odontoiatrico Dott. Bianchi', region: 'Piemonte', software: 'Windent', action: 'Esecuzione backup cloud', color: '#377DFF' },
      { name: 'Clinica Villa dei Fiori', region: 'Toscana', software: 'Windent', action: 'Accesso manuale paziente', color: '#377DFF' },
      { name: 'Studio Associato Adriatico', region: 'Puglia', software: 'Poliwin', action: 'Stampa prescrizioni mediche', color: '#F80086' },
      { name: 'Centro Odontoiatrico Trinacria', region: 'Sicilia', software: 'Poliwin', action: 'Sincronizzazione cartelle', color: '#F80086' },
      { name: 'Laboratorio Digitale Sardo', region: 'Sardegna', software: 'Windent', action: 'Ricerca FAQ sistema', color: '#377DFF' },
      { name: 'Studio Medico San Giorgio', region: 'Liguria', software: 'Windent', action: 'Consultazione listino prestazioni', color: '#377DFF' },
      { name: 'Poliambulatorio Scaligero', region: 'Veneto', software: 'Winodlab', action: 'Aggiornamento prontuario', color: '#F97316' },
      { name: 'Clinica Dolomiti Care', region: 'Trentino-Alto Adige', software: 'Winodlab', action: 'Archiviazione radiografie', color: '#F97316' },
      { name: 'Studio Riviera del Conero', region: 'Marche', software: 'Windent', action: 'Emissione fattura sanitaria', color: '#377DFF' },
      { name: 'Poliambulatorio Etruria', region: 'Umbria', software: 'Windent', action: 'Controllo diario clinico', color: '#377DFF' },
      { name: 'Centro Medico Gran Sasso', region: 'Abruzzo', software: 'Poliwin', action: 'Invio promemoria SMS', color: '#F80086' },
      { name: 'Studio Dentistico Sannita', region: 'Molise', software: 'Poliwin', action: 'Verifica consensi informati', color: '#F80086' },
      { name: 'Clinica Lucana Salute', region: 'Basilicata', software: 'Poliwin', action: 'Gestione anamnesi', color: '#F80086' },
      { name: 'Centro Odontoiatrico Magna Grecia', region: 'Calabria', software: 'Poliwin', action: 'Sincronizzazione archivio', color: '#F80086' },
      { name: 'Studio Alpi Graie', region: 'Valle d\'Aosta', software: 'Windent', action: 'Aggiornamento licenza', color: '#377DFF' },
      { name: 'Poliambulatorio Friulano', region: 'Friuli-Venezia Giulia', software: 'Windent', action: 'Consultazione manuale', color: '#377DFF' }
    ];

    // Popola feed iniziale
    this.liveFeed = clients.slice(0, 4).map((c, i) => ({
      id: 'f_' + i + '_' + Date.now(),
      region: c.region,
      clientName: c.name,
      software: c.software,
      action: c.action,
      time: `${i + 1} min fa`,
      color: c.color
    }));

    // Aggiunge un evento live ogni ~3.5 secondi
    this.feedInterval = setInterval(() => {
      const sample = clients[Math.floor(Math.random() * clients.length)];
      const node = this.accessMapNodes.find(n => n.name === sample.region || n.region === sample.region);
      if (node) {
        node.v += 1;
        this.activePingNode = node;
      }

      const newEvent: LiveAccessEvent = {
        id: 'f_' + Date.now(),
        region: sample.region,
        clientName: sample.name,
        software: sample.software,
        action: sample.action,
        time: 'Pochi secondi fa',
        color: sample.color
      };

      this.liveFeed = [newEvent, ...this.liveFeed.slice(0, 5)];
    }, 3500);

    // Ciclo di animazione radar ping sincrono
    this.pingInterval = setInterval(() => {
      if (this.accessMapNodes.length > 0) {
        const rnd = this.accessMapNodes[Math.floor(Math.random() * this.accessMapNodes.length)];
        this.activePingNode = rnd;
      }
    }, 2800);
  }

  // ---- Heatmap Oraria ----
  get accessHeatmap(): { rows: { day: string; cells: { h: number; v: number; alpha: number }[] }[]; max: number; hasData: boolean } {
    const days = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
    const hm = this.accessStats && Array.isArray(this.accessStats.heatmap) ? this.accessStats.heatmap : null;
    if (!hm || hm.length === 0) return { rows: [], max: 0, hasData: false };
    const rows = days.map((day, di) => ({
      day,
      cells: (((hm[di] as number[]) || [])).map((v: any, h: number) => ({ h, v: v || 0, alpha: 0 }))
    }));
    let max = 0;
    rows.forEach(r => r.cells.forEach(c => { if (c.v > max) max = c.v; }));
    const denom = max || 1;
    rows.forEach(r => r.cells.forEach(c => c.alpha = c.v === 0 ? 0.05 : 0.15 + 0.85 * (c.v / denom)));
    return { rows, max, hasData: max > 0 };
  }
}
