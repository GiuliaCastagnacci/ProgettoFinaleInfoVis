import json

# Percorso del file JSON (assicurati di aver eseguito i passaggi precedenti)
file_path = "percorso_del_tuo_file.json"

# Elenco ordinato delle attività
attivita_ordinate = ["Richiesta", "Prelievo", "Analisi", "Trapianto", "Monitoraggio"]

# Carica il contenuto del file JSON
with open("data3.json", "r") as file:
    json_data = json.load(file)

# Funzione per assegnare l'attività ai blocchi di ciascun "Codice Trapianto"
def assegna_attivita_per_codice_trapianto(blocks):
    for i, block in enumerate(blocks):
        if i < len(attivita_ordinate):
            block["activity"] = attivita_ordinate[i]
        else:
            # Se ci sono più di cinque blocchi per un "Codice Trapianto", ricomincia dalla prima attività
            block["activity"] = attivita_ordinate[i % len(attivita_ordinate)]

# Assegnare l'attività ai blocchi di ciascun "Codice Trapianto"
codici_trapianto = set(item["Codice Trapianto"] for item in json_data)
for codice_trapianto in codici_trapianto:
    blocks_with_codice_trapianto = [item for item in json_data if item["Codice Trapianto"] == codice_trapianto]
    assegna_attivita_per_codice_trapianto(blocks_with_codice_trapianto)

# Sovrascrivere il file JSON con i blocchi modificati
with open("data3.json", "w") as file:
    json.dump(json_data, file, indent=4)

print("Operazione completata. Le attività sono state assegnate ai blocchi con lo stesso 'Codice Trapianto'.")
