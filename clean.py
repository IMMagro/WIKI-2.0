import json

path = r"C:\Users\massimiliano.magrini\Desktop\Wiki-2.0\public\Data\guides.json"
with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

for cat in data['categories']:
    cat['manuals'] = []

with open(path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=4)
    
print("Guide e FAQ svuotate con successo!")
