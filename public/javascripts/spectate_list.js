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
    var keys = Object.keys(games);
    for (var i = 0; i < keys.length; ++i){
        var game = keys[i];
        var tr = document.createElement('tr');
        var tdId = document.createElement('td');
        var anchor = document.createElement('a');
        anchor.href = '/spectate/' + game;
        anchor.innerHTML = game;
        tdId.appendChild(anchor);
        var tdDate = document.createElement('td');
        tdDate.innerHTML = games[game];
        tr.appendChild(tdId);
        tr.appendChild(tdDate);
        tbody.appendChild(tr);
    }
}