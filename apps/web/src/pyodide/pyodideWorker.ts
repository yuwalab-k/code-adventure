/// <reference lib="webworker" />
import { loadPyodide, type PyodideInterface } from "pyodide";

// Loaded from CDN (not bundled) so the app doesn't ship the ~30MB wasm/data
// files to everyone who never opens the editor.
const PYODIDE_INDEX_URL = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";

let pyodidePromise: Promise<PyodideInterface> | null = null;

function getPyodide(): Promise<PyodideInterface> {
  if (!pyodidePromise) {
    pyodidePromise = loadPyodide({ indexURL: PYODIDE_INDEX_URL });
  }
  return pyodidePromise;
}

interface RunRequest {
  id: string;
  code: string;
  stdin: string;
}

interface RunResponse {
  id: string;
  stdout: string;
  stderr: string;
  errored: boolean;
}

// input() pops lines from the pre-seeded sample stdin; stdout is captured
// into an in-memory buffer instead of the (nonexistent) real console.
const PRELUDE = `
import sys, io, builtins
_stdin_lines = STDIN_PLACEHOLDER.split("\\n")
_stdin_index = 0
def _fake_input(prompt=""):
    global _stdin_index
    if _stdin_index >= len(_stdin_lines):
        raise EOFError("no more input")
    line = _stdin_lines[_stdin_index]
    _stdin_index += 1
    return line
builtins.input = _fake_input
sys.stdout = io.StringIO()
`;

self.onmessage = async (event: MessageEvent<RunRequest>) => {
  const { id, code, stdin } = event.data;
  const pyodide = await getPyodide();
  // Fresh globals per run so one sample's variables never leak into the next.
  const namespace = pyodide.globals.get("dict")();

  try {
    const prelude = PRELUDE.replace("STDIN_PLACEHOLDER", JSON.stringify(stdin));
    await pyodide.runPythonAsync(prelude, { globals: namespace });
    await pyodide.runPythonAsync(code, { globals: namespace });
    const stdout = await pyodide.runPythonAsync("sys.stdout.getvalue()", { globals: namespace });
    const response: RunResponse = { id, stdout: String(stdout), stderr: "", errored: false };
    postMessage(response);
  } catch (err) {
    const response: RunResponse = { id, stdout: "", stderr: String(err), errored: true };
    postMessage(response);
  } finally {
    namespace.destroy();
  }
};
