{ read-file-sync: read, write-file-sync: write, mkdir-sync: mkdir } = require \fs
{ join } = require \path

read-as-utf8 = (p) -> read p, \utf-8
cmd = (...p) -> join __dirname, ...p
mkdirp = (p) -> mkdir p, { recursive: true }

[dir, title] = do ->
  zero = (n, v) --> String(v).pad-start n, \0
  now = new Date!
  year = now.get-full-year! |> zero 4
  month = now.get-month! + 1 |> zero 2
  date = now.get-date! |> zero 2
  hours = now.get-hours! |> zero 2
  minutes = now.get-minutes! |> zero 2
  seconds = now.get-seconds! |> zero 2
  [
    [year, month, date, hours, minutes, seconds].join('-'),
    [year, month, date].join('/') + ' ' + [hours, minutes, seconds].join(':')
  ]

dir |> (n) -> join(n, 'src') |> mkdirp
\package.json.t |> cmd |> read-as-utf8 |> (body) -> write join(dir, 'package.json'), body
\tsconfig.json.t |> cmd |> read-as-utf8 |> (body) -> write join(dir, 'tsconfig.json'), body
\index.html.t |> cmd |> read-as-utf8 |> (body) -> write join(dir, 'index.html'), body.replace('#__TITLE__#', title)
\main.ts.t |> cmd |> read-as-utf8 |> (body) -> write join(dir, 'src', 'main.ts'), body
\vertex.wgsl.t |> cmd |> read-as-utf8 |> (body) -> write join(dir, 'src', 'vertex.wgsl'), body
\fragment.wgsl.t |> cmd |> read-as-utf8 |> (body) -> write join(dir, 'src', 'fragment.wgsl'), body
\type.d.ts.t |> cmd |> read-as-utf8 |> (body) -> write join(dir, 'src', 'type.d.ts'), body
console.log "npm i -D typescript @webgpu/types vite"