var refreshList = function () {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            var response = xmlHttp.response;
            removeAllRows();
            addNewRows(JSON.parse(response));
        }
    }
    xmlHttp.open("GET", '/spectate-list', true); 
    xmlHttp.send(null);
}

var removeAllRows = function () {
    var tbody = document.getElementById('table-body');
    while (tbody.lastChild != null)
        tbody.removeChild(tbody.lastChild);
}

var addNewRows = function (games) {
    var tbody = document.getElementById('table-body');
    for (var i = 0; i < games.length; ++i){
        var game = games[i];
        var tr = document.createElement('tr');
        var tdId = document.createElement('td');
        var anchor = document.createElement('a');
        anchor.href = '/spectate/' + game.id;
        anchor.innerHTML = game.id;
        tdId.appendChild(anchor);
        var tdDate = document.createElement('td');
        tdDate.sorttable_customkey = game.started;
        tdDate.innerHTML = game.text;
        tr.appendChild(tdId);
        tr.appendChild(tdDate);
        tbody.appendChild(tr);
    }
}