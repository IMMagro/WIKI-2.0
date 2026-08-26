import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GuideService } from '../../../services/guide.service';
import { HttpClient } from '@angular/common/http';

export interface MapCityNode {
  name: string;
  region: string;
  x: number;
  y: number;
  lat: number;
  lng: number;
  v: number; // total access hits
  active?: number; // current live concurrent sessions
  software?: string; // e.g. Windent, Poliwin, Winodlab
  macroArea?: 'nord' | 'centro' | 'sud';
}

export interface LiveAccessEvent {
  id: string;
  city: string;
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
  
  // Accurate vector path of Italy (Mainland, Sicily, Sardinia, and islands)
  readonly italyPath =
    'M31.504,35.963L32.197,36.658L33.816,37.405L38.055,36.39L40.675,35.429L42.602,34.359L43.758,34.573L47.92,36.123L49.307,35.322L52.313,33.236L52.775,32.112L55.087,28.735L55.164,27.93L54.163,25.781L54.471,25.351L57.399,23.145L58.864,21.206L60.405,19.912L61.484,19.912L61.793,20.343L61.947,21.26L61.793,24.975L62.255,26.103L64.567,28.788L66.186,30.29L69.962,31.308L70.116,31.844L69.114,33.825L71.426,36.23L71.812,37.939L72.891,38.953L74.355,38.472L74.817,37.512L74.278,35.91L73.816,34.199L73.893,33.236L74.355,32.112L75.357,30.558L78.209,26.909L79.211,24.867L79.442,21.583L79.442,18.995L80.367,18.347L82.37,18.833L82.987,18.779L83.295,20.397L84.143,22.93L85.145,24.221L86.224,24.544L87.534,24.544L90.694,22.984L92.775,22.337L93.931,22.499L94.625,23.576L96.166,26.372L97.014,26.641L98.016,26.318L98.401,25.888L98.016,24.813L97.63,22.499L97.014,20.667L96.243,19.858L96.089,18.725L96.551,16.781L97.091,15.105L98.17,14.672L99.48,14.456L101.099,16.186L103.025,16.781L104.49,16.673L104.721,15.646L104.644,14.51L103.796,13.102L103.95,10.88L104.952,6.809L105.492,7.135L107.65,7.189L110.039,7.406L111.503,9.09L112.967,9.633L115.125,9.796L116.513,9.578L117.206,8.981L118.054,7.026L119.519,4.578L121.908,3.38L125.915,3.108L127.996,2.672L130.077,2.727L131.619,3.108L133.237,3.054L137.399,1.364L141.715,0L142.331,0.218L142.409,0.709L141.638,1.691L140.867,3.054L141.407,4.633L143.796,7.732L145.106,10.121L146.416,11.91L148.343,12.831L150.886,13.427L153.044,13.644L155.356,14.293L163.063,15.97L166.994,16.402L170,16.511L174.47,17.591L174.008,19.373L173.16,19.804L171.541,20.883L169.692,22.284L168.073,23.899L167.611,25.62L168.073,26.748L168.536,27.124L169.152,26.802L170,27.017L171.156,27.608L173.006,28.252L173.083,28.842L172.697,29.593L171.233,30.933L169.923,32.487L169.769,33.396L169.923,34.092L170.385,34.52L172.312,34.306L172.62,34.894L171.695,38.793L172.004,39.486L173.699,40.126L174.932,41.031L177.245,43.533L178.246,45.554L177.553,46.191L176.088,46.563L174.932,46.35L176.243,45.128L172.929,40.765L171.464,40.765L169.46,42.629L163.911,40.712L162.832,41.511L162.062,43.001L160.135,44.863L157.437,45.66L154.354,47.678L151.195,49.11L148.728,50.223L147.341,50.011L149.576,47.678L148.574,47.624L145.646,49.269L143.95,50.7L143.41,53.029L142.871,56.939L144.181,57.942L146.493,63.051L149.268,65.206L148.728,67.306L148.035,68.932L146.339,70.346L144.875,69.299L144.027,69.299L143.41,72.649L144.644,81.415L146.57,87.597L148.497,90.24L152.89,94.429L157.514,96.598L165.838,103.601L170.385,105.758L171.541,106.99L174.316,112.317L176.705,118.494L179.248,128.101L181.098,132.86L184.797,138.161L192.505,145.758L199.441,151.322L205.915,154.722L211.002,155.322L222.947,154.573L225.028,154.872L227.263,155.821L227.726,158.166L226.955,159.761L224.412,161.405L221.868,163.693L221.56,166.822L223.949,169.005L235.51,174.796L247.302,179.633L251.001,182.096L255.24,185.931L265.568,191.18L267.263,193.726L273.583,199.149L276.358,203.388L276.897,206.646L275.587,209.899L274.97,212.226L273.891,214.55L271.194,213.679L268.188,211.305L263.641,201.732L255.317,200.758L253.622,200.026L250.616,198.368L250.462,197.294L249.691,195.926L248.997,195.438L245.76,195.144L243.602,196.708L240.982,200.416L238.053,205.723L235.048,213.485L234.893,216.581L236.512,219.624L241.367,221.312L245.067,224.011L247.533,226.801L247.764,233.521L248.843,237.351L247.225,239.501L244.065,238.976L239.903,240.361L236.897,242.795L235.664,245.13L235.972,251.217L235.356,253.495L229.73,257.854L226.801,262.297L226.03,264.138L224.951,266.26L217.784,266.307L216.165,263.714L216.088,259.888L217.321,257.523L219.942,256.386L221.637,251.455L221.098,247.891L222.177,246.32L223.102,245.225L225.105,244.558L227.957,243.939L228.188,238.928L226.03,236.633L225.26,233.473L224.181,227.523L220.558,219.962L218.632,213.194L217.167,209.85L214.855,208.055L210.693,208.103L208.612,207.618L201.214,202.852L200.751,202.122L200.751,200.904L201.984,198.953L201.214,196.415L200.289,193.971L198.901,191.866L197.283,190.788L193.969,191.474L192.813,191.964L190.732,191.768L189.113,192.698L188.189,192.747L190.732,189.073L190.038,188.239L187.495,186.717L184.027,186.472L183.102,186.275L182.485,187.257L181.869,186.717L181.946,185.096L177.861,177.709L175.164,174.697L173.853,174.153L171.387,174.796L167.225,173.461L164.759,173.164L163.449,173.511L161.368,174.45L160.366,173.857L159.981,172.868L156.281,169.748L151.58,168.013L142.486,158.216L139.711,154.523L133.931,150.471L130.308,144.502L127.303,142.341L122.987,140.58L121.985,140.781L120.675,141.435L119.673,141.536L118.902,140.781L119.673,139.975L120.598,139.623L120.289,137.355L115.357,131.393L112.428,129.52L111.657,128.304L111.041,126.681L110.424,125.666L109.037,125.006L107.881,125.159L106.262,124.752L106.339,121.855L106.648,119.666L106.416,117.781L104.875,112.879L102.101,108.682L100.559,98.661L99.249,95.824L96.243,93.654L89.461,91.275L80.058,84.742L78.054,84.638L72.351,82.091L68.806,81.675L64.259,83.911L58.71,90.188L54.163,96.649L52.544,97.939L46.764,100.154L41.6,101.184L41.523,99.536L41.369,98.3L42.217,96.907L43.681,95.307L44.991,93.241L45.531,91.793L45.299,90.809L44.683,89.359L43.835,89.256L38.98,90.447L37.823,90.136L34.201,88.271L30.348,85.885L28.883,84.223L28.344,82.559L28.729,81.467L28.421,80.426L27.65,79.019L28.344,77.403L29.577,75.367L30.193,74.009L31.195,73.643L31.658,72.806L30.887,69.456L30.425,68.932L29.731,68.512L28.652,68.46L26.802,67.778L25.415,66.624L25.107,65.048L24.413,63.577L23.18,62.157L23.103,60.683L24.413,59.892L26.34,59.84L27.65,60.156L30.656,57.731L31.735,57.52L32.737,56.992L33.508,53.664L34.201,52.658L34.355,52.076L33.739,51.388L31.35,49.004L30.193,46.563L28.498,43.852L26.879,42.629L26.571,41.671L26.494,40.445L26.879,39.432L29.731,37.779ZM147.495,155.721L147.495,155.522L147.264,155.522L147.264,155.671L147.264,155.771ZM148.497,97.217L149.114,95.669L148.882,94.584L147.495,94.791L146.57,96.185L147.187,97.423ZM103.719,127.949L104.413,129.064L104.49,129.723L104.027,130.482L104.258,132.152L102.409,130.735L99.711,131.444L98.093,131.292L97.63,130.077L98.016,129.317L100.559,129.165L101.407,128.811L102.948,128.963ZM179.557,189.71L178.632,189.955L178.092,189.661L177.784,189.22L178.169,188.141L180.096,188.778L180.019,189.367ZM139.172,298.145L138.17,298.424L136.782,297.542L136.705,296.243L136.937,295.825L138.632,296.428L139.094,297.635ZM214.624,258.658L213.159,261.778L212.466,262.958L207.302,270.497L206.763,272.236L206.377,274.114L205.838,275.757L205.144,277.351L204.45,279.318L204.528,281.564L204.836,282.639L205.452,283.387L206.454,284.041L207.225,285.069L205.992,286.049L207.379,287.914L208.458,289.033L208.612,290.151L208.612,291.268L206.3,293.408L205.375,294.524L204.759,295.964L204.528,297.403L204.759,298.702L204.682,300L202.37,299.815L199.903,299.027L197.514,299.397L194.046,297.867L192.813,297.635L191.657,297.032L188.728,292.385L186.416,290.384L183.95,288.847L181.406,288.753L178.863,288.94L176.628,288.008L172.081,284.835L167.225,282.265L165.144,280.629L164.22,279.505L163.141,278.756L160.366,278.007L157.823,276.272L156.744,276.179L154.277,276.366L153.044,276.272L151.811,275.663L149.345,273.598L147.803,270.779L147.418,269.556L148.497,266.307L149.807,263.242L150.963,262.345L152.274,261.731L153.121,260.786L153.815,259.699L156.281,262.911L157.437,263.714L158.516,263.525L160.52,262.392L160.674,261.117L162.909,259.462L165.684,259.462L166.994,259.746L167.688,261.211L168.767,261.636L170,261.872L174.085,264.657L175.241,265.081L176.397,265.176L179.557,263.997L181.946,263.572L187.033,264.185L189.807,263.478L191.734,263.43L194.508,262.345L196.666,260.55L197.822,260.124L198.978,259.982L201.907,260.077L204.836,260.502L206.069,260.077L207.071,258.895L208.304,258.374L209.614,258.753L213.005,256.718L214.47,256.623L215.857,257.381ZM87.38,184.752L88.459,186.57L90.848,193.971L91.079,195.535L90.617,197.196L90,198.319L87.611,202.025L87.997,205.091L88.844,206.986L88.998,209.074L88.536,211.693L87.072,227.523L86.378,230.308L85.916,232.706L84.297,233.473L82.139,232.659L79.519,231.316L78.286,231.412L77.053,231.891L76.051,231.46L75.049,230.692L74.355,236.107L73.122,238.307L71.349,239.692L69.577,239.788L67.804,239.31L66.34,239.31L65.184,238.307L64.259,236.49L62.871,234.24L61.407,231.604L61.253,229.252L61.022,224.011L61.407,222.855L62.024,221.746L62.332,219.383L62.101,217.306L62.563,216.581L63.411,217.306L64.028,217.064L63.95,216.001L64.182,214.066L63.026,212.42L61.176,211.887L61.022,210.19L61.176,208.492L62.178,207.375L62.486,205.917L62.563,201.342L61.176,199.685L60.714,197.147L60.02,195.535L58.787,193.873L57.399,192.552L56.475,191.278L56.32,187.895L56.783,185.047L57.245,183.867L57.708,184.014L59.095,185.44L60.251,185.735L62.486,186.079L64.721,185.637L67.419,184.359L70.039,182.834L73.816,178.252L76.128,177.364L77.361,176.13L77.746,174.499L78.748,174.104L79.904,175.685L81.368,175.834L83.604,177.117L84.528,178.4L85.376,179.879L86.147,180.52L86.995,180.914L87.149,181.259L86.455,181.603L85.684,183.326L86.147,183.818ZM62.717,235.437L61.484,238.163L60.174,236.25L60.097,234.575L60.328,234.096L61.87,234.814ZM58.556,180.273L57.862,181.554L56.86,181.456L57.245,180.52L58.17,178.597L59.326,177.956L59.789,178.499L59.249,179.633Z';

  // Interactive Map State
  selectedMacroRegion: 'all' | 'nord' | 'centro' | 'sud' = 'all';
  hoveredNode: MapCityNode | null = null;
  activePingNode: MapCityNode | null = null;
  
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
        { name: "Milano", region: "Lombardia", x: 72, y: 48, lat: 45.46, lng: 9.19, v: 142, active: 8, software: "Windent" },
        { name: "Roma", region: "Lazio", x: 138, y: 158, lat: 41.90, lng: 12.50, v: 189, active: 11, software: "Poliwin" },
        { name: "Torino", region: "Piemonte", x: 44, y: 56, lat: 45.07, lng: 7.69, v: 78, active: 4, software: "Windent" },
        { name: "Bologna", region: "Emilia-Romagna", x: 108, y: 78, lat: 44.49, lng: 11.34, v: 96, active: 6, software: "Winodlab" },
        { name: "Firenze", region: "Toscana", x: 112, y: 104, lat: 43.77, lng: 11.26, v: 84, active: 5, software: "Windent" },
        { name: "Napoli", region: "Campania", x: 172, y: 188, lat: 40.85, lng: 14.27, v: 115, active: 7, software: "Poliwin" },
        { name: "Venezia", region: "Veneto", x: 126, y: 46, lat: 45.44, lng: 12.32, v: 64, active: 3, software: "Windent" },
        { name: "Verona", region: "Veneto", x: 102, y: 46, lat: 45.43, lng: 10.99, v: 52, active: 3, software: "Winodlab" },
        { name: "Genova", region: "Liguria", x: 64, y: 78, lat: 44.41, lng: 8.93, v: 45, active: 2, software: "Windent" },
        { name: "Bari", region: "Puglia", x: 232, y: 194, lat: 41.12, lng: 16.87, v: 72, active: 4, software: "Poliwin" },
        { name: "Palermo", region: "Sicilia", x: 152, y: 266, lat: 38.12, lng: 13.36, v: 58, active: 3, software: "Poliwin" },
        { name: "Cagliari", region: "Sardegna", x: 66, y: 224, lat: 39.22, lng: 9.12, v: 41, active: 2, software: "Windent" }
      ]
    };
  }

  // ---- Mappa e Nodi ----
  get accessMapNodes(): MapCityNode[] {
    const raw: any[] = (this.accessStats && Array.isArray(this.accessStats.mapNodes)) ? this.accessStats.mapNodes : [];
    return raw.map(n => {
      const lat = Number(n.lat) || 0;
      let macro: 'nord' | 'centro' | 'sud' = 'centro';
      if (lat >= 44.0) macro = 'nord';
      else if (lat >= 41.5) macro = 'centro';
      else macro = 'sud';

      return {
        name: n.name,
        region: n.region || this.guessRegion(n.name),
        x: n.x,
        y: n.y,
        lat: n.lat,
        lng: n.lng,
        v: n.v || 0,
        active: n.active !== undefined ? n.active : Math.max(1, Math.round((n.v || 1) / 15)),
        software: n.software || (n.name === 'Roma' || n.name === 'Napoli' ? 'Poliwin' : n.name === 'Bologna' ? 'Winodlab' : 'Windent'),
        macroArea: macro
      };
    });
  }

  get filteredMapNodes(): MapCityNode[] {
    if (this.selectedMacroRegion === 'all') return this.accessMapNodes;
    return this.accessMapNodes.filter(n => n.macroArea === this.selectedMacroRegion);
  }

  get accessMapNodesSorted(): MapCityNode[] {
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

  get topCity(): MapCityNode | null {
    if (!this.accessMapNodes.length) return null;
    return [...this.accessMapNodes].sort((a, b) => b.v - a.v)[0];
  }

  private guessRegion(city: string): string {
    const map: Record<string, string> = {
      'Milano': 'Lombardia', 'Torino': 'Piemonte', 'Genova': 'Liguria', 'Venezia': 'Veneto',
      'Verona': 'Veneto', 'Trieste': 'Friuli-VG', 'Bologna': 'Emilia-Romagna', 'Firenze': 'Toscana',
      'Ancona': 'Marche', 'Perugia': 'Umbria', 'Roma': 'Lazio', 'Pescara': 'Abruzzo',
      'Napoli': 'Campania', 'Bari': 'Puglia', 'Lecce': 'Puglia', 'Catanzaro': 'Calabria',
      'Palermo': 'Sicilia', 'Catania': 'Sicilia', 'Cagliari': 'Sardegna', 'Sassari': 'Sardegna'
    };
    return map[city] || 'Italia';
  }

  // ---- Simulazione Live Stream / Real-time Ping ----
  private initLiveFeed() {
    const clients = [
      { name: 'Studio Dentistico DentalCare', city: 'Milano', region: 'Lombardia', software: 'Windent', action: 'Apertura cartella clinica', color: '#377DFF' },
      { name: 'Poliambulatorio San Marco', city: 'Roma', region: 'Lazio', software: 'Poliwin', action: 'Gestione agenda appuntamenti', color: '#F80086' },
      { name: 'Lab Odontotecnico F.lli Rossi', city: 'Bologna', region: 'Emilia-Romagna', software: 'Winodlab', action: 'Invio lavorazione cad/cam', color: '#F97316' },
      { name: 'Centro Medico Tirreno', city: 'Napoli', region: 'Campania', software: 'Poliwin', action: 'Consultazione guida fatturazione', color: '#F80086' },
      { name: 'Studio Odontoiatrico Dott. Bianchi', city: 'Torino', region: 'Piemonte', software: 'Windent', action: 'Esecuzione backup cloud', color: '#377DFF' },
      { name: 'Clinica Villa dei Fiori', city: 'Firenze', region: 'Toscana', software: 'Windent', action: 'Accesso manuale paziente', color: '#377DFF' },
      { name: 'Studio Associato Adriatico', city: 'Bari', region: 'Puglia', software: 'Poliwin', action: 'Stampa prescrizioni mediche', color: '#F80086' },
      { name: 'Centro Odontoiatrico Trinacria', city: 'Palermo', region: 'Sicilia', software: 'Poliwin', action: 'Sincronizzazione dati', color: '#F80086' },
      { name: 'Laboratorio Digitale Sardo', city: 'Cagliari', region: 'Sardegna', software: 'Windent', action: 'Ricerca FAQ sistema', color: '#377DFF' },
      { name: 'Studio Medico San Giorgio', city: 'Genova', region: 'Liguria', software: 'Windent', action: 'Consultazione listino prestazioni', color: '#377DFF' }
    ];

    // Popola feed iniziale
    this.liveFeed = clients.slice(0, 4).map((c, i) => ({
      id: 'f_' + i + '_' + Date.now(),
      city: c.city,
      region: c.region,
      clientName: c.name,
      software: c.software,
      action: c.action,
      time: `${i + 1} min fa`,
      color: c.color
    }));

    // Aggiunge un evento live ogni ~3.8 secondi
    this.feedInterval = setInterval(() => {
      const sample = clients[Math.floor(Math.random() * clients.length)];
      const node = this.accessMapNodes.find(n => n.name === sample.city);
      if (node) {
        node.v += 1;
        this.activePingNode = node;
      }

      const newEvent: LiveAccessEvent = {
        id: 'f_' + Date.now(),
        city: sample.city,
        region: sample.region,
        clientName: sample.name,
        software: sample.software,
        action: sample.action,
        time: 'Pochi secondi fa',
        color: sample.color
      };

      this.liveFeed = [newEvent, ...this.liveFeed.slice(0, 5)];
    }, 3800);

    // Ciclo di animazione radar ping
    this.pingInterval = setInterval(() => {
      if (this.accessMapNodes.length > 0) {
        const rnd = this.accessMapNodes[Math.floor(Math.random() * this.accessMapNodes.length)];
        this.activePingNode = rnd;
      }
    }, 2400);
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
