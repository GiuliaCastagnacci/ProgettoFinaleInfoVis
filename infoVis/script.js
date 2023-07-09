var data = [];

  // Carica i dati da un file JSON
  function loadDataFromJSON() {
    d3.json("data.json").then(function(jsonData) {
      data = jsonData;
      updateGanttChart();
      showTaskInfo(0);
    }).catch(function(error) {
      console.log("Errore nel caricamento dei dati da JSON:", error);
    });
  }
  

  // function saveDataToJSON() {
    // var jsonData = JSON.stringify(data, null, 2);

    //var blob = new Blob([jsonData], { type: "application/json" });
    //var url = URL.createObjectURL(blob);

    //var a = document.createElement("a");
    //a.href = url;
    //a.download = "data.json";
    //a.click();

    //URL.revokeObjectURL(url);
  // }

    // Dimensioni del grafico
    var width = 1000;
    var height = 400;

    // Margini del grafico
    var margin = { top: 20, right: 30, bottom: 50, left: 180 };
    var innerWidth = width - margin.left - margin.right;
    var innerHeight = height - margin.top - margin.bottom;

    // Creazione del grafico di Gantt
    var svg = d3.select("#ganttChart")
      .append("svg")
      .attr("width", width)
      .attr("height",height);

    // Crea la scala x
    var xScale = d3.scaleTime()
      .range([0, innerWidth]);

    // Crea la scala y
    var yScale = d3.scaleBand()
      .range([0, innerHeight])
      .padding(0.1);

    // Crea gli assi x e y
    var xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.timeFormat("%d"))
      .tickSize(0)
      .tickPadding(8);
    var yAxis = d3.axisLeft(yScale);

    // Raggruppa il grafico all'interno dei margini
    var g = svg.append("g")
     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Aggiungi l'asse x
    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(0," + innerHeight + ")")
      .call(xAxis);

    // Aggiungi l'asse y
    g.append("g")
      .attr("class", "y-axis")
      .call(yAxis);

      
    // Aggiorna il grafico di Gantt
    function updateGanttChart() {
  
      // Estrai la lista dei centri trapianti organi
      var centers = data.map(function(d) { return d.center; });
      centers = Array.from(new Set(centers)); // Rimuovi i duplicati

      // Crea la scala x
      xScale.domain([
        d3.min(data, function(d) { return new Date(d.startDate); }),
        d3.max(data, function(d) { return new Date(d.endDate); })
      ]);

      // Crea la scala y
      yScale.domain(centers);

      // Aggiorna l'asse x
      svg.select(".x-axis")
        .transition()
        .duration(500)
        .call(xAxis)
        .selectAll(".tick text")
        .text(function(d) { return getFormattedDate(d); });


      // Aggiorna l'asse y
      svg.select(".y-axis")
        .transition()
        .duration(500)
        .call(yAxis);

      // Aggiorna le barre delle attività
      var bars = g.selectAll(".bar")
        .data(data, function(_, i) { return i; });

        bars.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("data-id", function(d) { return d.id; })
        .merge(bars)
        .attr("x", function(d) { return xScale(new Date(d.startDate)); })
        .attr("y", function(d) { return yScale(d.center); })
        .attr("width", function(d) { return xScale(new Date(d.endDate)) - xScale(new Date(d.startDate)); })
        .attr("height", yScale.bandwidth())
        .attr("fill", function(d) { return getStatusColor(d.activity); })
        
        .on("click", function() {
          var id = d3.select(this).attr("data-id");
          showTaskInfo(id);
        })
        
        
      

      bars.exit().remove();
}

  // Crea la legenda
var legend = svg.append("g")
  .attr("class", "legend")
  .attr("transform", "translate(" + (innerWidth + margin.right) + "," + margin.top + ")");

var legendData = [
  { label: "In esecuzione", color: "#7FFF00" },
  { label: "In elaborazione", color: "#B886FF" },
  { label: "Richiesta", color: "#7EA6E0" }
];

var legendItem = legend.selectAll(".legend-item")
  .data(legendData)
  .enter()
  .append("g")
  .attr("class", "legend-item")
  .attr("transform", function(d, i) { return "translate(0," + (i * 20) + ")"; });

legendItem.append("rect")
  .attr("width", 10)
  .attr("height", 10)
  .attr("fill", function(d) { return d.color; });

legendItem.append("text")
  .attr("x", 20)
  .attr("y", 8)
  .text(function(d) { return d.label; });

// Formatta data grafico Gantt
  function getFormattedDate(date) {
  var day = date.getDate();
  var monthNames = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
  var month = monthNames[date.getMonth()];
  var year = date.getFullYear();
  return day.toString().padStart(2, '0') + '\n' + month + '\n' + year;
}

// Funzione per controllare il formato del codice fiscale
function validateCodiceFiscale(codiceFiscale) {
  var codiceFiscaleRegExp = /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/;
  return codiceFiscaleRegExp.test(codiceFiscale);
}

// Funzione per controllare se un codice fiscale è valido
function isCodiceFiscaleValid(codiceFiscale) {
  return validateCodiceFiscale(codiceFiscale);
}

function isIdAlreadyUsed(id) {
  return data.some(function(task) {
    return task.id === id;
  });
}

function isCodiceFiscaleAlreadyUsed(codiceFiscale) {
  return data.some(function(task) {
    return task.codiceFiscale === codiceFiscale;
  });
}


// Funzione per aprire la finestra modale e visualizzare le informazioni dell'attività
function showTaskInfo(id) {
  var task = data.find(function(d) {
    return d.id === id;
  });

  if (task) {
    var modal = document.getElementById("taskModal");
    var modalContent = document.getElementById("modalContent");
    modalContent.innerHTML = ""; // Resetta il contenuto della finestra modale

    var idElement = document.createElement("p");
    idElement.innerHTML = "<strong>ID:</strong> " + task.id;
    modalContent.appendChild(idElement);
    
    // Aggiungi le informazioni dell'attività alla finestra modale
    var center = document.createElement("p");
    center.innerHTML = "<strong>Centro:</strong> " + task.center;
    modalContent.appendChild(center);

    var startDate = document.createElement("p");
    startDate.innerHTML = "<strong>Data inizio:</strong> " + task.startDate;
    modalContent.appendChild(startDate);

    var endDate = document.createElement("p");
    endDate.innerHTML = "<strong>Data fine:</strong> " + task.endDate;
    modalContent.appendChild(endDate);

    var activity = document.createElement("p");
    activity.innerHTML = "<strong>Attivit&#224:</strong> " + task.activity;
    modalContent.appendChild(activity);

    var codiceFiscale = document.createElement("p");
    codiceFiscale.innerHTML = "<strong>Codice fiscale:</strong> " + task.codiceFiscale;
    modalContent.appendChild(codiceFiscale);

    var informazioniTrapianto = document.createElement("p");
    informazioniTrapianto.innerHTML = "<strong>Informazioni trapianto:</strong> " + task.informazioniTrapianto;
    modalContent.appendChild(informazioniTrapianto);

    modal.style.display = "block";
  }
}

// Funzione per chiudere la finestra modale
function closeTaskModal() {
  var modal = document.getElementById("taskModal");
  modal.style.display = "none";
}

// Aggiungi un gestore di eventi per il pulsante di chiusura
var closeButton = document.getElementById("closeButton");
closeButton.addEventListener("click", closeTaskModal);






// Aggiunge un'attività al grafico
function addTask(event) {
  event.preventDefault();

  var startDateInput = document.getElementById('startDateInput');
  var endDateInput = document.getElementById('endDateInput');
  var activitySelect = document.getElementById('activitySelect');
  var centerSelect = document.getElementById('centerSelect');
  var idInput = document.getElementById('idInput');

  var startDate = new Date(startDateInput.value);
  var endDate = new Date(endDateInput.value);

  var codiceFiscaleInput = document.getElementById('codiceFiscaleInput');
  var informazioniTrapiantoInput = document.getElementById('informazioniTrapiantoInput');

  if (startDate.getFullYear().toString().length > 4 || endDate.getFullYear().toString().length > 4) {
    alert("anno inserito non valido, inserisci solo 4 cifre");
    return; // Esce dalla funzione senza aggiungere l'attività
  }

  if (startDate > endDate) {
    alert("La data di inizio deve essere precedente alla data di fine");
    return; // Esce dalla funzione senza aggiungere l'attività
  }

  // Verifica se lo slot temporale è già occupato per il centro selezionato
  var isSlotOccupied = data.some(function(task) {
    var taskStartDate = new Date(task.startDate);
    var taskEndDate = new Date(task.endDate);

    return (
      task.center === centerSelect.value &&
      (
        (startDate >= taskStartDate && startDate <= taskEndDate) ||
        (endDate >= taskStartDate && endDate <= taskEndDate) ||
        (startDate <= taskStartDate && endDate >= taskEndDate)
      )
    );
  });

  if (isSlotOccupied) {
    alert("Slot temporale occupato per il centro selezionato");
    return; // Esce dalla funzione senza aggiungere l'attività
  }

  var codiceFiscale = codiceFiscaleInput.value.trim();
  if (!isCodiceFiscaleValid(codiceFiscale)) {
    alert("Il codice fiscale inserito non e' valido.");
    return; // Esce dalla funzione senza aggiungere l'attività
  }
  if (isCodiceFiscaleAlreadyUsed(codiceFiscale)) {
    alert("Il codice fiscale inserito e' gia' presente in un altro time slot. Inserire un codice fiscale unico.");
    return; // Esce dalla funzione senza aggiungere l'attività
  }

  var id = idInput.value.trim();
  if (isIdAlreadyUsed(id)) {
    alert("L'ID inserito e' gia' utilizzato in un altro time slot. Scegliere un ID unico.");
    return; // Esce dalla funzione senza aggiungere l'attività
  }


  var task = {
    id: idInput.value.trim(),
    center: centerSelect.value,
    startDate: startDateInput.value,
    endDate: endDateInput.value,
    activity: activitySelect.value,
    codiceFiscale: codiceFiscale,
    informazioniTrapianto: informazioniTrapiantoInput.value.trim()
  };
  

  var id = parseInt(idInput.value, 10);
  if (!isNaN(id) && id >= 0 && id < data.length) {
    // Modifica l'attività esistente
    data[id] = task;
  } else {
    // Aggiungi una nuova attività
    data.push(task);
  }

  // Aggiorna il grafico di Gantt
  updateGanttChart();

  // Resetta i campi di input
  startDateInput.value = '';
  endDateInput.value = '';
  idInput.value = '';
  codiceFiscaleInput.value = '';
  informazioniTrapiantoInput.value = '';

  // Salva i dati nel file JSON
  // saveDataToJSON();
}


function editTask() {
  var idInput = document.getElementById('idInput');
  var id = idInput.value.trim();

  var selectedTask = data.find(function(task) {
    return task.id === id;
  });

  if (selectedTask) {
    var startDateInput = document.getElementById('startDateInput');
    var endDateInput = document.getElementById('endDateInput');
    var activitySelect = document.getElementById('activitySelect');
    var centerSelect = document.getElementById('centerSelect');
    var codiceFiscaleInput = document.getElementById('codiceFiscaleInput');
    var informazioniTrapiantoInput = document.getElementById('informazioniTrapiantoInput');

    var newStartDate = new Date(startDateInput.value);
    var newEndDate = new Date(endDateInput.value);

    if (newStartDate.getFullYear().toString().length > 4 || newEndDate.getFullYear().toString().length > 4) {
      alert("Anno inserito non valido, inserisci solo 4 cifre!");
      return;
    }

    if (newStartDate > newEndDate) {
      alert("La data di inizio deve essere precedente alla data di fine");
      return;
    }

    // Verifica se le nuove date si sovrappongono ad altre attività per il centro selezionato
    var isSlotOccupied = data.some(function(task) {
      if (task.id !== id && task.center === centerSelect.value) {
        var taskStartDate = new Date(task.startDate);
        var taskEndDate = new Date(task.endDate);

        return (
          (newStartDate >= taskStartDate && newStartDate <= taskEndDate) ||
          (newEndDate >= taskStartDate && newEndDate <= taskEndDate) ||
          (newStartDate <= taskStartDate && newEndDate >= taskEndDate)
        );
      }
      return false;
    });

    if (isSlotOccupied) {
      alert("Le nuove date si sovrappongono ad altre attività per il centro selezionato");
      return;
    }

    var codiceFiscale = codiceFiscaleInput.value.trim();
    if (!isCodiceFiscaleValid(codiceFiscale)) {
      alert("Il codice fiscale inserito non è valido.");
      return;
    }

    selectedTask.startDate = startDateInput.value;
    selectedTask.endDate = endDateInput.value;
    selectedTask.activity = activitySelect.value;
    selectedTask.center = centerSelect.value;
    selectedTask.codiceFiscale = codiceFiscale;
    selectedTask.informazioniTrapianto = informazioniTrapiantoInput.value.trim();

    // Aggiorna il grafico di Gantt
    updateGanttChart();

    // Resetta i campi di input
    startDateInput.value = '';
    endDateInput.value = '';
    idInput.value = '';
    codiceFiscaleInput.value = '';
    informazioniTrapiantoInput.value = '';

    // Salva i dati nel file JSON
    saveDataToJSON();
  } else {
    alert("ID non valido!");
  }
}


function deleteTask() {
  var idInput = document.getElementById('idInput');
  var id = idInput.value.trim();

  var index = data.findIndex(function(task) {
    return task.id === id;
  });

  if (index !== -1) {
    data.splice(index, 1); // Rimuovi l'attività dall'array dei dati

    // Aggiorna il grafico di Gantt
    updateGanttChart();

    // Resetta i campi di input
    idInput.value = '';

    // Salva i dati nel file JSON
    saveDataToJSON();
  } else {
    alert("ID non valido!");
  }
}


    // Scarica i dati del grafico in un file JSON
    function loadDataFromJSON() {
      d3.json("data.json")
        .then(function(jsonData) {
          data = jsonData;
          updateGanttChart();
        })
        .catch(function(error) {
          console.log("Errore nel caricamento dei dati da JSON:", error);
        });
    }
    
      // Scarica i dati del grafico in un file JSON
function downloadData() {
  var jsonData = JSON.stringify(data, null, 2);

  var blob = new Blob([jsonData], { type: "application/json" });
  var url = URL.createObjectURL(blob);

  var a = document.createElement("a");
  a.href = url;
  a.download = "dati.json";
  a.click();

  URL.revokeObjectURL(url);
}


  // Funzione per salvare i dati inseriti
  function saveDataToJSON() {
    downloadData();
  }

  // Funzione per ottenere il colore dello stato dell'attività
  function getStatusColor(status) {
    // Codice per ottenere il colore in base allo stato dell'attività
    if (status === "In esecuzione") {
      return "#7FFF00";
    } else if (status === "In elaborazione") {
      return "#B886FF";
    } else if (status === "Richiesta") {
      return "#7EA6E0";
    } else {
      return "gray";
    }
  }

  // Carica i dati al caricamento della pagina
  window.addEventListener('DOMContentLoaded', function() {
    loadDataFromJSON();
  });