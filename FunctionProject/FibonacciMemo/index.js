var bigInt = require("big-integer");

// Cache a nivel de modulo: vive mientras el proceso de esta instancia siga vivo.
// Se pierde cuando Azure libera la instancia (inactividad) o al escalar a otra instancia.
const memo = new Map([[0, bigInt.zero], [1, bigInt.one]]);

// Fibonacci recursivo con memoization
function fib(n) {
    if (memo.has(n)) return memo.get(n);
    const value = fib(n - 1).add(fib(n - 2));
    memo.set(n, value);
    return value;
}

module.exports = async function (context, req) {
    const raw = (req.body && req.body.nth !== undefined) ? req.body.nth : (req.query ? req.query.nth : undefined);
    const nth = Number(raw);

    if (raw === undefined || !Number.isInteger(nth) || nth < 0) {
        context.res = { status: 400, body: { error: "Envia un entero nth >= 0 en el body JSON, ej. {\"nth\": 1000}" } };
        return;
    }

    const cacheAntes = memo.size;
    const cacheHit = memo.has(nth);
    const t0 = Date.now();

    try {
        const answer = fib(nth).toString();
        context.res = {
            headers: { "Content-Type": "application/json" },
            body: {
                nth: nth,
                digitos: answer.length,
                inicio: answer.substring(0, 20),
                cacheHit: cacheHit,
                tamanoCacheAntes: cacheAntes,
                tamanoCacheDespues: memo.size,
                tiempoMs: Date.now() - t0,
                instancia: process.env.WEBSITE_INSTANCE_ID || "local",
                procesoActivoSegundos: Math.round(process.uptime())
            }
        };
    } catch (e) {
        context.res = {
            status: 500,
            body: {
                error: e instanceof RangeError ? "Desbordamiento de pila (recursion demasiado profunda)" : String(e),
                nth: nth,
                tamanoCache: memo.size
            }
        };
    }
};
