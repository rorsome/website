import test from 'node:test';
import assert from 'node:assert';
import worker from '../src/index.js';

test('redirects uppercase paths to lowercase', async () => {
  const request = new Request('https://example.com/UPPERCASE');
  const env = {
    ASSETS: {
      fetch: () => new Response('ok')
    }
  };

  const response = await worker.fetch(request, env);

  assert.strictEqual(response.status, 301);
  assert.strictEqual(response.headers.get('Location'), 'https://example.com/uppercase');
});

test('does not redirect lowercase paths', async () => {
  const request = new Request('https://example.com/lowercase');
  const env = {
    ASSETS: {
      fetch: () => new Response('ok')
    }
  };

  const response = await worker.fetch(request, env);

  assert.strictEqual(response.status, 200);
  const body = await response.text();
  assert.strictEqual(body, 'ok');
});

test('ensures percent-encoded sequences are matched as units and remain unchanged while other characters are lowercased', async () => {
  const request = new Request('https://example.com/MixEd%20Case%2FPath');
  const env = {
    ASSETS: {
      fetch: () => new Response('ok')
    }
  };

  const response = await worker.fetch(request, env);

  assert.strictEqual(response.status, 301);
  // Based on regex /%[0-9A-Fa-f]{2}|[A-Z]/g:
  // %20 and %2F match the first part and stay as they are (uppercase hex).
  // [A-Z] match the second part and get lowercased.
  assert.strictEqual(response.headers.get('Location'), 'https://example.com/mixed%20case%2Fpath');
});

test('handles query parameters correctly', async () => {
  const request = new Request('https://example.com/UPPER?query=VAL');
  const env = {
    ASSETS: {
      fetch: () => new Response('ok')
    }
  };

  const response = await worker.fetch(request, env);

  assert.strictEqual(response.status, 301);
  // Query parameters should not be touched
  assert.strictEqual(response.headers.get('Location'), 'https://example.com/upper?query=VAL');
});
