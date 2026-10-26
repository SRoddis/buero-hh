/**
 * SalesViewer® (Firmenerkennung für den Vertrieb) – nur nach Zustimmung zu „Externe Dienste & Marketing“.
 * Kennung des bisherigen Kontos; NEXT_PUBLIC_SALESVIEWER_ID="" schaltet das Tracking ab.
 */
const SALESVIEWER_ID = process.env.NEXT_PUBLIC_SALESVIEWER_ID ?? "R6g4e0f2P6K8";

let loaded = false;

/** Offizielles Einbettungs-Snippet von SalesViewer (unverändert wie auf der bisherigen Website) */
export function loadSalesViewer() {
  if (loaded || !SALESVIEWER_ID || !/^[A-Za-z0-9]+$/.test(SALESVIEWER_ID)) return;
  loaded = true;
  const script = document.createElement("script");
  script.text = `!(function (s, a, l, e, sv, i, ew, er) {try {(a =s[a] || s[l] || function () {throw "no_xhr";}),(sv = i = "https://salesviewer.org"),(ew = function(x){(s = new Image()), (s.src = "https://salesviewer.org/tle.gif?sva=${SALESVIEWER_ID}&u="+encodeURIComponent(window.location)+"&e=" + encodeURIComponent(x))}),(l = s.SV_XHR = function (d) {return ((er = new a()),(er.onerror = function () {if (sv != i) return ew("load_err");
(sv = "https://www.salesviewer.com/t"), setTimeout(l.bind(null, d), 0);}),(er.onload = function () {(s.execScript || s.eval).call(er, er.responseText);}),er.open("POST", sv, !0),(er.withCredentials = true),er.send(d),er);}),l("h_json=" + 1 * ("JSON" in s && void 0 !== JSON.parse) + "&h_wc=1&h_event=" + 1 * ("addEventListener" in s) + "&sva=" + e);} catch (x) {ew(x)}})(window, "XDomainRequest", "XMLHttpRequest", "${SALESVIEWER_ID}");`;
  document.head.appendChild(script);
}
