# Let your app take actions

An agent on a Full Cell acts on the outside world through your app. Your app
publishes an HTTPS endpoint for each action, such as sending a message or
creating a record. Zero-AR calls it only when a grant covers the action or a
person approved it, and reports the action as done only when your app's
answer says so. Your app keeps the integration, the credentials and the
rules about what it will do.

This page builds an endpoint, checks it with `zeroar target check`, and
registers it with a Full Cell. It takes about fifteen minutes.

## What a call looks like

Zero-AR calls your endpoint with the same conventions webhook providers and
payment APIs use:

| Part | Convention |
|---|---|
| Signature | [Standard Webhooks](https://www.standardwebhooks.com): `webhook-id`, `webhook-timestamp` and `webhook-signature`, an HMAC-SHA256 over the id, the timestamp and the body |
| Body | The action's parameters as JSON, with `Content-Digest` (RFC 9530) over the exact bytes |
| Repeats | `Idempotency-Key`. A call can arrive twice when an answer is lost; apply each key once and return the first answer again |
| Context | `x-zero-ar-run-id` names the run the action is for, and `x-zero-ar-effect-id` the action. Use the run to send a reply back to the run that asked; neither grants anything |
| Answer | The status code. A 2xx other than 202 says the action was applied. A definite 4xx says your app declined it; Problem Details (RFC 9457) explain why |

Any other answer leaves the outcome unknown: 202, 408, 425, 429, any 5xx, a
timeout or a dropped connection. Zero-AR then asks your lookup endpoint, does
not send the action again until it knows what happened, and does not report
the work as verified while the outcome is unknown.

The lookup is a GET to a path you name, signed the same way and carrying
the same `Idempotency-Key`. Return the first answer again for a key you
applied, and 404 for a key you never received.

## Write the endpoint

A complete endpoint for one action, creating a task, in TypeScript on
Node.js 24 with no dependencies:

```ts
// An app endpoint the Zero-AR runtime can act through. It checks the
// Standard Webhooks signature, applies each Idempotency-Key once and keeps
// the first answer, and answers with a status code.
// Run it with TARGET_SECRET=whsec_... node handler.ts
import { createHmac, timingSafeEqual } from 'node:crypto';
import { createServer, type IncomingMessage } from 'node:http';

const secret = Buffer.from(String(process.env.TARGET_SECRET).replace(/^whsec_/, ''), 'base64');
const firstAnswers = new Map<string, { status: number; body: string }>(); // keep these in your database

function signed(request: IncomingMessage, body: string): boolean {
  const { 'webhook-id': id, 'webhook-timestamp': timestamp, 'webhook-signature': signatures = '' } = request.headers;
  if (!id || !timestamp || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const expected = createHmac('sha256', secret).update(`${id}.${timestamp}.${body}`).digest();
  return String(signatures).split(' ').some((entry) => {
    const given = Buffer.from(entry.replace(/^v1,/, ''), 'base64');
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
}

const server = createServer(async (request, response) => {
  let body = '';
  for await (const chunk of request) body += chunk;
  const answer = (status: number, text: string) => response.writeHead(status, { 'content-type': status < 400 ? 'application/json' : 'application/problem+json' }).end(text);
  if (!signed(request, body)) return answer(401, '{"title":"The signature does not verify"}');
  const key = String(request.headers['idempotency-key']);
  const first = firstAnswers.get(key);
  if (first) return answer(first.status, first.body);
  if (request.method === 'GET') return answer(404, '{"title":"No call carried this key"}'); // the lookup
  const { title } = JSON.parse(body) as { title?: string };
  if (!title) return answer(422, '{"title":"A task needs a title"}');
  const task = { task_id: `task_${firstAnswers.size + 1}`, title }; // your app's action goes here
  firstAnswers.set(key, { status: 201, body: JSON.stringify(task) });
  answer(201, JSON.stringify(task));
});
server.listen(Number(process.env.PORT ?? 8080), '127.0.0.1', () => console.log(`listening on ${JSON.stringify(server.address())}`));
```

The same endpoint in Python 3.9 or later, with the standard library alone:

```python
# An app endpoint the Zero-AR runtime can act through. It checks the
# Standard Webhooks signature, applies each Idempotency-Key once and keeps
# the first answer, and answers with a status code.
# Run it with TARGET_SECRET=whsec_... python3 handler.py
import base64, hashlib, hmac, json, os, time
from http.server import BaseHTTPRequestHandler, HTTPServer

SECRET = base64.b64decode(os.environ["TARGET_SECRET"].removeprefix("whsec_"))
first_answers = {}  # keep these in your database

def signed(headers, body):
    msg_id, stamp = headers.get("webhook-id"), headers.get("webhook-timestamp", "")
    if not msg_id or not stamp.isdigit() or abs(time.time() - int(stamp)) > 300:
        return False
    expected = base64.b64encode(hmac.new(SECRET, f"{msg_id}.{stamp}.".encode() + body, hashlib.sha256).digest()).decode()
    return any(hmac.compare_digest(entry.removeprefix("v1,"), expected) for entry in headers.get("webhook-signature", "").split())

class Target(BaseHTTPRequestHandler):
    def answer(self, status, text):
        self.send_response(status)
        self.send_header("content-type", "application/json" if status < 400 else "application/problem+json")
        self.end_headers()
        self.wfile.write(text.encode())

    def do_POST(self):
        body = self.rfile.read(int(self.headers.get("content-length", 0)))
        if not signed(self.headers, body):
            return self.answer(401, '{"title": "The signature does not verify"}')
        key = self.headers.get("idempotency-key")
        if key in first_answers:
            return self.answer(*first_answers[key])
        if self.command == "GET":  # the lookup
            return self.answer(404, '{"title": "No call carried this key"}')
        title = json.loads(body).get("title")
        if not title:
            return self.answer(422, '{"title": "A task needs a title"}')
        first_answers[key] = (201, json.dumps({"task_id": f"task_{len(first_answers) + 1}", "title": title}))  # your app's action goes here
        self.answer(*first_answers[key])

    do_GET = do_POST

HTTPServer(("127.0.0.1", int(os.environ.get("PORT", 8080))), Target).serve_forever()
```

Keep the first answers in your database, in the same transaction as the
action, so a repeat after a restart still gets the first answer. The
[Standard Webhooks libraries](https://github.com/standard-webhooks/standard-webhooks)
verify the signature in one call if you prefer one.

## Describe it

The target file names the endpoint, its operations and their paths. It is
the entry you will put under `effect_plane.http_targets`:

```json
{
  "target": "tasks",
  "version": "1",
  "endpoint": "http://localhost:8080",
  "wire": "standard",
  "credential_binding_ref": "secret://tasks-target",
  "operations": {
    "create_task": {
      "path": "/tasks",
      "reversible": false,
      "reconcile_path": "/tasks/lookup"
    }
  }
}
```

`wire: "standard"` selects the conventions above and is the default in 0.6.0: the secret stays with Zero-AR and each call carries a signature that
is good for that call alone. For an earlier bearer target, explicitly set `wire: "zero-ar-json"`: it sends the secret itself as a bearer token and
expects the outcome in the body. `credential_binding_ref` names the secret the cell
signs with; the check reads the same secret from your shell. Register the
HTTPS address in place of `localhost`.

## Check it

Make a secret, start the endpoint with it, and run the check from the same
shell:

```sh
export ZEROAR_TARGET_SECRET="whsec_$(openssl rand -base64 24)"
TARGET_SECRET="$ZEROAR_TARGET_SECRET" node handler.ts &
zeroar target check target.json --operation create_task \
  --params '{"title":"Check the endpoint"}' --refuse-params '{}'
```

```text
tasks.create_task at http://localhost:8080, standard wire
  warn  endpoint             plain HTTP on this machine. The runtime dispatches over HTTPS only, so check the HTTPS endpoint again before you register it.
  pass  call                 applied (HTTP 201) in 28 ms.
  pass  repeated key         it returned the first answer.
  pass  other secret         refused (HTTP 401).
  pass  stale call           refused (HTTP 401).
  pass  refused call         refused (HTTP 422).
  pass  lookup, applied key  found applied.
  pass  lookup, unknown key  absent (HTTP 404).
passed: the runtime reads every answer this target gave.
```

The check calls your endpoint the way a Full Cell does and reads each answer
the way a Full Cell reads it:

| Check | It passes when |
|---|---|
| call | The sample parameters are applied with a 2xx, inside half the 30 seconds Zero-AR waits |
| repeated key | The same call again returns the first answer, or `already_applied` |
| other secret | A call signed with another secret is refused with a 4xx |
| stale call | A correct signature from ten minutes ago is refused with a 4xx |
| refused call | The `--refuse-params` call is refused with a definite 4xx |
| lookup, applied key | The lookup finds the key the call applied |
| lookup, unknown key | The lookup answers 404 for a key it never received |

A warning names something to fix before production; a failure names an
answer that would leave an outcome unknown or wrong, and the command exits
with status 1. `--json` prints the same report as JSON, to keep with the
target's review. The check applies the action, so point it at a test
deployment of your app. It shows how your endpoint answers, not what your
app does with the action.

## Register it

Add the target file's entry to the tenant's `effect_plane.http_targets` in
the Full Cell configuration, with `credential_binding_ref` naming the secret
in the tenant's secret store, and give the agent a grant for the operation,
or an approver who decides each call. [Running Zero-AR](running-zero-ar.md)
describes the configuration file and secret references.

## Signed receipts

An app that signs its answers gives each receipt the app's own signature.
Register the app's Ed25519 public key as `receipt_key_pem` on the target,
and return `owner_signature` in the answer: a compact JWS, algorithm EdDSA,
over a JSON object with the call's `effect_id` (the `x-zero-ar-effect-id`
header), `idempotency_key`, `target`, `operation`, `param_hash` (`sha256:`
and the hex SHA-256 of the body) and `outcome`. A signature that does not verify leaves the outcome unknown. An
app that does not sign still works; its receipts carry Zero-AR's
attestation alone.
