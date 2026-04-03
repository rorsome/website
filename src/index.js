export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const lower = url.pathname.replace(/%[0-9A-Fa-f]{2}|[A-Z]/g, m =>
      m.length === 1 ? m.toLowerCase() : m
    );

    if (url.pathname !== lower) {
      url.pathname = lower;
      return Response.redirect(url.toString(), 301);
    }

    return env.ASSETS.fetch(request);
  },
};
