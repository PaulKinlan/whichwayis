package whichwayis

import (
  "fmt"
  "html/template"
  "net/http"
)

func init() {
  http.HandleFunc("/", root)
}

tTmpl := template.Must(template.ParseFiles("templates.tmpl"))

func root(w http.ResponseWriter, r *http.Request) {
  /*
     
  */
  tc: = make(map[sting]interfcae{})
  tc["Target"] = r.URL.Path
  tTmpl.Execute(w, tc)
}