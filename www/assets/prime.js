const bench = {
  "100MB": {
    label: "Hutter enwik8 · 100 MB",
    inputBytes: 100000000,
    rawBytes: 26944227,
    duBytes: 30074599,
    rawEncode: 22.04,
    duEncode: 14.32,
    rawDecode: 0.11,
    duEntropyDecode: 0.10,
    structuralEncode: 1.45,
    structuralRestore: 0.18,
    retained: 87124272,
    crossover: 3.24
  },

  "1GB": {
    label: "Hutter enwik9 · 1 GB",
    inputBytes: 1000000000,
    rawBytes: 235328939,
    duBytes: 261269279,
    rawEncode: 104.27,
    duEncode: 79.71,
    rawDecode: 0.90,
    duEntropyDecode: 0.93,
    structuralEncode: 10.67,
    structuralRestore: 1.18,
    retained: 872888513,
    crossover: 8.45
  },

  "10GB": {
    label: "OKC extended · 10 GB",
    inputBytes: 10000000000,
    rawBytes: 2321300290,
    duBytes: 2559321541,
    rawEncode: 853.83,
    duEncode: 691.80,
    rawDecode: null,
    duEntropyDecode: 8.95,
    structuralEncode: 137.29,
    structuralRestore: 12.84,
    retained: 8304007514,
    crossover: 11.75
  },

  "100GB": {
    label: "OKC extended · 100 GB",
    inputBytes: 100000000000,
    rawBytes: 19100831510,
    duBytes: 21201168641,
    rawEncode: 8034.64,
    duEncode: 6687.94,
    rawDecode: 91.20,
    duEntropyDecode: 86.00,
    structuralEncode: 1563.86,
    structuralRestore: 218.47,
    retained: 83030749792,
    crossover: 12.48
  }
};

let benchScale = "1GB";
let benchMode = "network";

const $ = s => document.querySelector(s);

function fmtBytes(b) {
  if (b >= 1e9) return `${(b/1e9).toFixed(3)} GB`;
  if (b >= 1e6) return `${(b/1e6).toFixed(1)} MB`;
  if (b >= 1e3) return `${(b/1e3).toFixed(1)} KB`;
  return `${b} B`;
}

function fmtTime(sec) {
  if (sec < 1) return `${(sec*1000).toFixed(0)} ms`;
  if (sec < 60) return `${sec.toFixed(sec < 10 ? 2 : 1)} s`;
  if (sec < 3600) return `${(sec/60).toFixed(2)} min`;
  if (sec < 86400) return `${(sec/3600).toFixed(2)} h`;
  return `${(sec/86400).toFixed(2)} d`;
}

function pct(a, b) {
  return ((a / b - 1) * 100);
}

function rate() {
  return 10 ** Number($("#rate").value);
}

function tx(bytes, mbps) {
  return bytes * 8 / (mbps * 1e6);
}

function setPair(rawLabel, rawPrimary, rawSecondary,
                 duLabel, duPrimary, duSecondary) {
  $("#raw-label").textContent = rawLabel;
  $("#raw-primary").textContent = rawPrimary;
  $("#raw-secondary").textContent = rawSecondary;

  $("#du-label").textContent = duLabel;
  $("#du-primary").textContent = duPrimary;
  $("#du-secondary").textContent = duSecondary;
}

function setTradeoff(d) {
  const byteDelta = d.duBytes - d.rawBytes;
  const wallDelta = d.duEncode - d.rawEncode;

  $("#decision-delta-bytes").textContent =
    `${byteDelta >= 0 ? "+" : "−"}${fmtBytes(Math.abs(byteDelta))}`;

  $("#decision-delta-wall").textContent =
    `${wallDelta >= 0 ? "+" : "−"}${fmtTime(Math.abs(wallDelta))}`;
}

function drawDecision() {
  const d = bench[benchScale];
  const network = $("#network-controls");

  $("#decision-scope").textContent = d.label;
  setTradeoff(d);

  if (benchMode === "fastest") {
    network.hidden = true;

    const delta = d.rawEncode - d.duEncode;

    $("#decision-boundary").textContent = "MATCHED ZSTD19 · ENCODE";
    $("#decision-title").textContent = "Encode wall";

    $("#decision-copy").textContent =
      "Same zstd19 backend, different preprocessing path.";

    setPair(
      "raw zstd19",
      fmtTime(d.rawEncode),
      `${fmtBytes(d.rawBytes)} artifact`,
      "DU3 + zstd19",
      fmtTime(d.duEncode),
      `${fmtBytes(d.duBytes)} artifact`
    );

    $("#decision-callout").textContent =
      delta > 0
        ? `DU3 lane −${fmtTime(delta)}`
        : `raw lane −${fmtTime(-delta)}`;

    $("#decision-note").textContent =
      "Matched-backend encode view only. It is not a claim that DU3 is the overall fastest compressor; low-level raw zstd remains the speed reference.";

    return;
  }

  if (benchMode === "smallest") {
    network.hidden = true;

    const delta = d.duBytes - d.rawBytes;
    const percent = Math.abs(pct(d.rawBytes, d.duBytes));

    $("#decision-boundary").textContent = "FINAL TRANSPORT BYTES";
    $("#decision-title").textContent = "Artifact size";

    $("#decision-copy").textContent =
      "Current measured zstd19 transport artifacts.";

    setPair(
      "raw zstd19",
      fmtBytes(d.rawBytes),
      `${fmtTime(d.rawEncode)} encode`,
      "DU3 + zstd19",
      fmtBytes(d.duBytes),
      `${fmtTime(d.duEncode)} encode`
    );

    $("#decision-callout").textContent =
      delta > 0
        ? `raw is ${percent.toFixed(1)}% smaller`
        : `DU3 is ${percent.toFixed(1)}% smaller`;

    $("#decision-note").textContent =
      "Size and encode wall are separate dimensions. The smaller artifact is not automatically the faster end-to-end path.";

    return;
  }

  if (benchMode === "structure") {
    network.hidden = true;

    const reduction = (1 - d.retained / d.inputBytes) * 100;

    $("#decision-boundary").textContent = "BEFORE ENTROPY";
    $("#decision-title").textContent = "Structural representation";

    $("#decision-copy").textContent =
      "DU3 structural bytes before any downstream entropy backend.";

    setPair(
      "input",
      fmtBytes(d.inputBytes),
      "original corpus",
      "DU3 retained",
      fmtBytes(d.retained),
      `${fmtTime(d.structuralEncode)} structural encode`
    );

    $("#decision-callout").textContent =
      reduction >= 0
        ? `${reduction.toFixed(2)}% structural reduction`
        : `${Math.abs(reduction).toFixed(2)}% structural overhead`;

    $("#decision-delta-bytes").textContent =
      `${d.retained <= d.inputBytes ? "−" : "+"}${fmtBytes(Math.abs(d.inputBytes - d.retained))}`;
    $("#decision-delta-wall").textContent =
      `${fmtTime(d.structuralEncode)} encode`;

    $("#decision-note").textContent =
      `Exact reconstruction · structural restore ${fmtTime(d.structuralRestore)}. Entropy is intentionally excluded from this view.`;

    return;
  }

  // NETWORK
  network.hidden = false;

  const mbps = rate();

  $("#rate-label").textContent =
    mbps < .1 ? `${Math.round(mbps*1000)} kbps` :
    mbps >= 1000 ? `${(mbps/1000).toFixed(1)} Gbps` :
    `${mbps.toFixed(mbps < 10 ? 1 : 0)} Mbps`;

  const rawTotal = d.rawEncode + tx(d.rawBytes, mbps);
  const duTotal  = d.duEncode  + tx(d.duBytes, mbps);
  const delta = Math.abs(rawTotal - duTotal);

  $("#decision-boundary").textContent = "ENCODE + IDEALIZED TRANSFER";
  $("#decision-title").textContent = "Network-aware";

  $("#decision-copy").textContent =
    "Move the link speed. The winner changes when extra transport bytes outweigh encode-time savings.";

  setPair(
    "raw zstd19",
    fmtTime(rawTotal),
    `${fmtBytes(d.rawBytes)} over the wire`,
    "DU3 + zstd19",
    fmtTime(duTotal),
    `${fmtBytes(d.duBytes)} over the wire`
  );

  $("#decision-callout").textContent =
    duTotal < rawTotal
      ? `DU3 ahead by ${fmtTime(delta)}`
      : `raw ahead by ${fmtTime(delta)}`;

  $("#decision-note").textContent =
    `Measured crossover ≈ ${d.crossover.toFixed(2)} Mbps for this workload. This view is encode + idealized transfer, not full roundtrip.`;
}

document.querySelectorAll("[data-mode]").forEach(button => {
  button.onclick = () => {
    benchMode = button.dataset.mode;

    document.querySelectorAll("[data-mode]").forEach(x =>
      x.classList.remove("active")
    );

    button.classList.add("active");
    drawDecision();
  };
});

document.querySelectorAll("[data-bench-scale]").forEach(button => {
  button.onclick = () => {
    benchScale = button.dataset.benchScale;

    document.querySelectorAll("[data-bench-scale]").forEach(x =>
      x.classList.remove("active")
    );

    button.classList.add("active");
    drawDecision();
  };
});

document.querySelectorAll("[data-rate]").forEach(button => {
  button.onclick = () => {
    $("#rate").value = Math.log10(Number(button.dataset.rate));
    drawDecision();
  };
});

$("#rate").oninput = drawDecision;
drawDecision();


/* ---- local file inspector / future DU3 WASM surface ---- */

const fileInput = document.querySelector("#file-input");
const pickFile = document.querySelector("#pick-file");
const dropzone = document.querySelector("#dropzone");

pickFile.onclick = () => fileInput.click();

function fmtFileBytes(n) {
  if (n < 1000) return `${n} B`;
  if (n < 1e6) return `${(n/1e3).toFixed(2)} KB`;
  if (n < 1e9) return `${(n/1e6).toFixed(2)} MB`;
  return `${(n/1e9).toFixed(2)} GB`;
}

function hexDump(buffer, limit=256) {
  const a = new Uint8Array(buffer, 0, Math.min(buffer.byteLength, limit));
  let out = [];

  for (let offset=0; offset<a.length; offset+=16) {
    const row = a.slice(offset, offset+16);
    const hex = [...row]
      .map(x => x.toString(16).padStart(2,"0"))
      .join(" ")
      .padEnd(47, " ");

    const ascii = [...row]
      .map(x => x >= 32 && x <= 126 ? String.fromCharCode(x) : ".")
      .join("");

    out.push(
      offset.toString(16).padStart(8,"0") +
      "  " + hex + "  |" + ascii + "|"
    );
  }
  return out.join("\n");
}

async function inspectFile(file) {
  document.querySelector("#inspect-state").textContent = "READING";
  document.querySelector("#inspect-name").textContent = file.name;

  const r0 = performance.now();
  const buf = await file.arrayBuffer();
  const r1 = performance.now();

  document.querySelector("#inspect-state").textContent = "HASHING";

  const h0 = performance.now();
  const digest = await crypto.subtle.digest("SHA-256", buf);
  const h1 = performance.now();

  const hash = [...new Uint8Array(digest)]
    .map(x => x.toString(16).padStart(2,"0"))
    .join("");

  document.querySelector("#inspect-bytes").textContent =
    fmtFileBytes(buf.byteLength);

  document.querySelector("#inspect-read").textContent =
    `${(r1-r0).toFixed(2)} ms`;

  document.querySelector("#inspect-hash-time").textContent =
    `${(h1-h0).toFixed(2)} ms`;

  document.querySelector("#inspect-hash").textContent = hash;
  document.querySelector("#hex-view").textContent = hexDump(buf);
  document.querySelector("#inspect-state").textContent = "READY";

  /*
   * Future:
   *
   * const du = wasm.du_encode(new Uint8Array(buf));
   * const restored = wasm.du_decode(du);
   *
   * UI then reports:
   * - encode wall
   * - retained bytes
   * - local vocab
   * - ID stream
   * - decode wall
   * - restored SHA equality
   */
}

fileInput.onchange = () => {
  if (fileInput.files[0]) inspectFile(fileInput.files[0]);
};

["dragenter","dragover"].forEach(type => {
  dropzone.addEventListener(type, e => {
    e.preventDefault();
    dropzone.classList.add("drag");
  });
});

["dragleave","drop"].forEach(type => {
  dropzone.addEventListener(type, e => {
    e.preventDefault();
    dropzone.classList.remove("drag");
  });
});

dropzone.addEventListener("drop", e => {
  const file = e.dataTransfer.files[0];
  if (file) inspectFile(file);
});
