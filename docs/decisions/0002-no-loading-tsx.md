# 0002. This site ships no loading.tsx anywhere

Status: accepted.

## Context

Adding a `loading.tsx` is the reflexive thing to do in an App Router project. It is usually free and
usually an improvement, so someone will eventually add one to this codebase believing it is an
obvious win.

On this site it would be a silent regression, and the failure is invisible in a browser.

## The mechanism

Two documented behaviours combine badly:

1. `not-found.js` is wrapped by `loading.js`'s Suspense boundary.
2. `not-found` returns **200 for streamed responses**, and 404 only for non-streamed ones.

So introducing a single `loading.tsx` anywhere above the not-found boundary converts every 404 on
this site into a **soft 404**: the page still says "not found" to a human, and still returns 200 to a
crawler. Google treats soft 404s as low-quality duplicates, and nothing in a visual review catches
it, because the rendered page looks exactly right.

## Decision

Ship no `loading.tsx`. Anywhere.

The cost is zero, because every page on this site is prerendered at build time. There is no data
fetch to wait on, so there is no loading state to show. A loading skeleton would be pure overhead
protecting against a delay that cannot occur.

## Consequence

`src/app/[locale]/not-found.tsx` deliberately has no Suspense boundary and does no async data work,
for the same reason.

This is enforced by observation rather than by a lint rule: the verification chain asserts the
**status code** of six different 404 shapes before it looks at the rendered body, precisely because
the body is not where this defect shows up.

```powershell
foreach ($u in @("/bilinmeyen","/a/b/c","/veltrex.pdf","/is-kollari/yok","/en/nope","/en/divisions/nope")) {
  curl.exe -s -o NUL -w "$u %{http_code}`n" "http://127.0.0.1:3111$u"
}
# every line must read 404, never 200 and never 308
```

If a future change genuinely needs a loading state, for example because a page starts fetching live
data, then that page needs its own scoped `loading.tsx` below the not-found boundary, and the 404
status matrix above must be re-run to prove the boundary still holds.
