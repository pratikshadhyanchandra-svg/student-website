var WEB_APP_URL = 'PASTE_YOUR_WEB_APP_URL_HERE';

var headers = [];
var rows = [];
var sortCol = -1;
var sortAsc = true;

var statusEl = document.getElementById('status');
var countEl = document.getElementById('count');
var thead = document.getElementById('thead');
var tbody = document.getElementById('tbody');
var searchBox = document.getElementById('searchBox');

function showError(msg) {
  statusEl.className = 'err';
  statusEl.textContent = msg;
}

function loadData() {
  if (WEB_APP_URL.indexOf('PASTE_') === 0) {
    showError('Open script.js and paste your Google Apps Script Web App URL.');
    return;
  }

  fetch(WEB_APP_URL)
    .then(function (res) {
      if (!res.ok) throw new Error('Server replied with status ' + res.status);
      return res.json();
    })
    .then(function (list) {
      if (!list || list.length === 0) {
        showError('The Google Sheet has no student records.');
        return;
      }

      headers = Object.keys(list[0]);
      rows = list.map(function (o) {
        return headers.map(function (h) { return o[h]; });
      });

      statusEl.textContent = '';
      statusEl.className = '';
      drawHead();
      render();
    })
    .catch(function (err) {
      showError('Could not load data. ' + err.message + '. Check your Web App URL.');
      console.error(err);
    });
}

function drawHead() {
  var tr = document.createElement('tr');
  headers.forEach(function (h, i) {
    var th = document.createElement('th');
    th.textContent = h;
    th.addEventListener('click', function () {
      if (sortCol === i) { sortAsc = !sortAsc; }
      else { sortCol = i; sortAsc = true; }
      render();
    });
    tr.appendChild(th);
  });
  thead.innerHTML = '';
  thead.appendChild(tr);
}

function render() {
  var q = searchBox.value.trim().toLowerCase();
  var searchCols = [];
  headers.forEach(function (h, i) {
    var l = h.toLowerCase();
    if (l.indexOf('roll') !== -1 || l.indexOf('name') !== -1) searchCols.push(i);
  });
  if (searchCols.length === 0) {
    searchCols = headers.map(function (h, i) { return i; });
  }

  var list = rows.filter(function (r) {
    if (!q) return true;
    return searchCols.some(function (i) {
      return String(r[i]).toLowerCase().indexOf(q) !== -1;
    });
  });

  if (sortCol >= 0) {
    list.sort(function (a, b) {
      var x = a[sortCol], y = b[sortCol];
      var nx = parseFloat(x), ny = parseFloat(y);
      var r = (!isNaN(nx) && !isNaN(ny))
        ? nx - ny
        : String(x).localeCompare(String(y));
      return sortAsc ? r : -r;
    });
  }

  tbody.innerHTML = '';
  list.forEach(function (r) {
    var tr = document.createElement('tr');
    r.forEach(function (v, i) {
      var td = document.createElement('td');
      td.textContent = (v === null || v === undefined) ? '' : v;
      td.setAttribute('data-label', headers[i]);
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  countEl.textContent = 'Showing ' + list.length + ' of ' + rows.length + ' students';
}

searchBox.addEventListener('input', render);
loadData();
