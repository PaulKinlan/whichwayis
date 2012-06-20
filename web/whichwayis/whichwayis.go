package whichwayis

import (
  "html/template"
  "net/http"
)

func init() {
  http.HandleFunc("/", root)
}

var tTmpl = template.Must(template.ParseFiles("templates/index.tmpl"))

func root(w http.ResponseWriter, r *http.Request) {
  tc := make(map[string]interface{})
  tc["Target"] = r.URL.Path[1:len(r.URL.Path)]
  tTmpl.Execute(w, tc)
}
