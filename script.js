let graph = {};
let pos = {};

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;


function loadDemo() {
    graph = {
        A: [{ node: "B", w: 3 }, { node: "C", w: 4 }],

        B: [{ node: "A", w: 3 }, { node: "D", w: 5 }, { node: "E", w: 6 }],
        C: [{ node: "A", w: 4 }, { node: "F", w: 5 }],

        D: [{ node: "B", w: 5 }, { node: "G", w: 4 }],
        E: [{ node: "B", w: 6 }, { node: "G", w: 2 }, { node: "H", w: 5 }],
        F: [{ node: "C", w: 5 }, { node: "H", w: 6 }],

        G: [{ node: "D", w: 4 }, { node: "E", w: 2 }, { node: "I", w: 3 }],
        H: [{ node: "E", w: 5 }, { node: "F", w: 6 }, { node: "J", w: 4 }],

        I: [{ node: "G", w: 3 }, { node: "J", w: 2 }],
        J: [{ node: "H", w: 4 }, { node: "I", w: 2 }]
    };

    
    pos = {
        A: { x: 80, y: 200 },

        B: { x: 200, y: 100 },
        C: { x: 200, y: 300 },

        D: { x: 350, y: 60 },
        E: { x: 350, y: 200 },
        F: { x: 350, y: 340 },

        G: { x: 520, y: 120 },
        H: { x: 520, y: 280 },

        I: { x: 650, y: 150 },
        J: { x: 650, y: 300 }
    };

    draw();
}

/* ===== ADD EDGE ===== */
function addEdge() {
    let u = from.value.trim();
    let v = to.value.trim();
    let w = parseInt(weight.value);

    if (!u || !v || isNaN(w)) return;

    if (!graph[u]) {
        graph[u] = [];
        pos[u] = randomPos();
    }

    if (!graph[v]) {
        graph[v] = [];
        pos[v] = randomPos();
    }

    graph[u].push({ node: v, w });
    graph[v].push({ node: u, w });

    draw();
}

function randomPos() {
    return {
        x: Math.random() * (WIDTH - 80) + 40,
        y: Math.random() * (HEIGHT - 80) + 40
    };
}

/* ===== DRAW ===== */
function draw(path = []) {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    let drawn = new Set();

    for (let u in graph) {
        for (let e of graph[u]) {
            let v = e.node;

            let key = u + "-" + v;
            let rev = v + "-" + u;

            if (drawn.has(key) || drawn.has(rev)) continue;
            drawn.add(key);

            ctx.beginPath();
            ctx.moveTo(pos[u].x, pos[u].y);
            ctx.lineTo(pos[v].x, pos[v].y);

            let isPath = inPath(u, v, path);

            ctx.strokeStyle = isPath ? "#3498db" : "#bbb";
            ctx.lineWidth = isPath ? 3 : 1;

            ctx.stroke();

            let mx = (pos[u].x + pos[v].x) / 2;
            let my = (pos[u].y + pos[v].y) / 2;

            ctx.fillStyle = "#2c3e50";
            ctx.fillText(e.w, mx + 5, my - 5);
        }
    }

    for (let n in pos) {
        ctx.beginPath();
        ctx.arc(pos[n].x, pos[n].y, 12, 0, Math.PI * 2);
        ctx.fillStyle = "#2c3e50";
        ctx.fill();

        ctx.fillStyle = "white";
        ctx.fillText(n, pos[n].x - 4, pos[n].y + 4);
    }
}

function inPath(u, v, path) {
    for (let i = 0; i < path.length - 1; i++) {
        if (
            (path[i] === u && path[i + 1] === v) ||
            (path[i] === v && path[i + 1] === u)
        ) return true;
    }
    return false;
}

/* ===== DIJKSTRA ===== */
function dijkstra(start, end) {
    let dist = {}, prev = {}, visited = {};

    for (let n in graph) {
        dist[n] = Infinity;
        prev[n] = null;
        visited[n] = false;
    }

    dist[start] = 0;

    for (let i = 0; i < Object.keys(graph).length; i++) {
        let u = null;

        for (let n in dist) {
            if (!visited[n] && (u === null || dist[n] < dist[u])) {
                u = n;
            }
        }

        if (u === null) break;

        visited[u] = true;

        for (let e of graph[u]) {
            let v = e.node;
            let newDist = dist[u] + e.w;

            if (newDist < dist[v]) {
                dist[v] = newDist;
                prev[v] = u;
            }
        }
    }

    return buildPath(prev, end, dist[end]);
}

/* ===== A* ===== */
function heuristic(a, b) {
    let dx = pos[a].x - pos[b].x;
    let dy = pos[a].y - pos[b].y;
    return Math.sqrt(dx * dx + dy * dy);
}

function astar(start, end) {
    let open = new Set([start]);
    let g = {}, f = {}, prev = {};

    for (let n in graph) {
        g[n] = Infinity;
        f[n] = Infinity;
        prev[n] = null;
    }

    g[start] = 0;
    f[start] = heuristic(start, end);

    while (open.size > 0) {
        let current = [...open].reduce((a, b) => f[a] < f[b] ? a : b);

        if (current === end) break;

        open.delete(current);

        for (let e of graph[current]) {
            let temp = g[current] + e.w;

            if (temp < g[e.node]) {
                prev[e.node] = current;
                g[e.node] = temp;
                f[e.node] = temp + heuristic(e.node, end);
                open.add(e.node);
            }
        }
    }

    return buildPath(prev, end, g[end]);
}


function buildPath(prev, end, cost) {
    let path = [];
    let cur = end;

    while (cur) {
        path.unshift(cur);
        cur = prev[cur];
    }

    let hops = path.length - 1;
    let avg = hops > 0 ? (cost / hops).toFixed(2) : 0;

    return { path, cost, hops, avg };
}

/* ===== OUTPUT ===== */
function showOutput(res, algo, time) {
    let out = document.getElementById("output");
    out.classList.remove("show");

    setTimeout(() => {
        out.innerHTML = `
            <b>${algo}</b><br>
            Path: ${res.path.join(" → ")}<br>
            <span style="color:#2ecc71;font-weight:bold;">Cost: ${res.cost}</span><br>
            Hops: ${res.hops}<br>
            Avg Edge: ${res.avg}<br>
            Time: ${time} ms
        `;
        out.classList.add("show");
    }, 50);
}

/* ===== RUN ===== */
function runDijkstra() {
    let t1 = performance.now();
    let res = dijkstra(start.value.trim(), end.value.trim());
    let t2 = performance.now();

    showOutput(res, "Dijkstra", (t2 - t1).toFixed(3));
    draw(res.path);
}

function runAstar() {
    let t1 = performance.now();
    let res = astar(start.value.trim(), end.value.trim());
    let t2 = performance.now();

    showOutput(res, "A*", (t2 - t1).toFixed(3));
    draw(res.path);
}