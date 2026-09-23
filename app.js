(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  var PROMPTS = [
    'the elevator that only goes down politely',
    'a Tuesday delivered two days early',
    'the museum of almost remembered songs',
    'a vending machine dispensing one safe future',
    'the last umbrella in a city without rain',
    'a door that remembers being a window',
    'the receipt for becoming slightly taller',
    'an old friend arriving from the wrong Tuesday',
    'the moon filing a very small complaint',
    'a map leading to the room behind the room',
    'the spare hour nobody put back',
    'a perfectly ordinary spaceship with one missing chair'
  ];
  var TYPES = {
    parcel: {
      label: "Tomorrow's parcel label",
      short: 'PARCEL',
      subtitles: [
        'Return to sender: the timeline changed twice.',
        'Delivered before the order was placed.',
        'Route: directly through consequence.',
        'Please do not bend the plausible future.'
      ]
    },
    museum: {
      label: 'Museum acquisition card',
      short: 'MUSEUM',
      subtitles: [
        'Accession granted by an employee who does not exist yet.',
        'Display condition: emotionally fragile.',
        'Provenance begins here and politely stops.',
        'Please do not feed the exhibit.'
      ]
    },
    weather: {
      label: 'Interdimensional weather bulletin',
      short: 'SKY',
      subtitles: [
        'Forecast compiled from tomorrow’s side of the glass.',
        'Probability of reality: fluctuating but technically high.',
        'Conditions include a faint smell of improbable cinnamon.',
        'This bulletin was issued before the weather existed.'
      ]
    },
    'lost-found': {
      label: 'Lost & found from 2041',
      short: 'LOST',
      subtitles: [
        'Last seen between the present and the obvious.',
        'Please identify before the next remembered day.',
        'Reward: one clear memory and a damp paperclip.',
        'Do not return by conventional routes.'
      ]
    }
  };
  var PALETTES = {
    parcel: { accent: '#e8bd62', soft: '#342c20' },
    museum: { accent: '#7bd4a1', soft: '#193128' },
    weather: { accent: '#69c6f4', soft: '#172e3a' },
    'lost-found': { accent: '#c49bfa', soft: '#2d233d' }
  };
  var ORIGINS = [
    'a municipal basement three minutes from tomorrow',
    'the quiet side of a moon with no official name',
    'a train that leaves only when it is forgotten',
    'the lost-property office beneath a different sky',
    'a room behind the room where the kettle lives',
    'an archive maintained by extremely tired birds',
    'the interval between two ordinary Tuesdays',
    'a station that appears on maps after rain'
  ];
  var FIELD_NOTES = [
    'The seal is intact, but the date predates the ink.',
    'Whoever signed this form used a hand that has not been invented yet.',
    'The object weighs almost nothing, except for one memorable minute.',
    'Dust analysis returned a color that is not on the approved spectrum.',
    'It is warmer on the side nobody thought to check.',
    'The measurements change when observed directly.',
    'A faint sound suggests it is waiting for a name.',
    'It survived the event described on the attached card.'
  ];
  var ANNOTATIONS = [
    'Do not open near an open window or an open question.',
    'Archive staff recommend against making eye contact with the paperwork.',
    'The last three copies were returned undelivered.',
    'This is not an omen, although it has excellent timing.',
    'If it changes, document the change before agreeing to it.',
    'The label was printed before the ink was manufactured.',
    'Classification: real enough to laminate.',
    'Proceed with curiosity and a spare coat.'
  ];
  var STATUSES = [
    { max: 24, label: 'Archival / pending review' },
    { max: 49, label: 'Unverified / locally plausible' },
    { max: 74, label: 'Disputed / probably real' },
    { max: 100, label: 'Impossible / do not sell' }
  ];
  var state = { nonce: 1, current: null };

  function hashString(value) {
    var hash = 2166136261;
    var text = String(value);
    for (var i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function choose(list, seed) {
    return list[seed % list.length];
  }

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function normalizeText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim().replace(/[.!?;:]+$/g, '').slice(0, 160);
  }

  function seededRandom(seed) {
    var value = seed >>> 0;
    return function () {
      value += 0x6D2B79F5;
      var t = value;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function statusFor(signal) {
    for (var i = 0; i < STATUSES.length; i += 1) {
      if (signal <= STATUSES[i].max) return STATUSES[i].label;
    }
    return STATUSES[STATUSES.length - 1].label;
  }

  function titleFor(type, subject) {
    if (type === 'museum') return subject + ': Unresolved Acquisition';
    if (type === 'weather') return 'Conditions Report: ' + subject;
    if (type === 'lost-found') return subject + ' — Still Not Found';
    return subject + ' — Return to Sender';
  }

  function createRelic(text, typeKey, strangeness, nonce) {
    var config = TYPES[typeKey] || TYPES.parcel;
    var palette = PALETTES[typeKey] || PALETTES.parcel;
    var subject = normalizeText(text) || 'an unnamed event';
    var strange = Math.max(0, Math.min(100, Number(strangeness) || 0));
    var roll = Math.max(1, Number(nonce) || 1);
    var seed = hashString(subject + '|' + typeKey + '|' + strange + '|' + roll);
    var seedDate = hashString('date|' + seed);
    var seedOrigin = hashString('origin|' + seed);
    var seedNote = hashString('note|' + seed);
    var seedAnnotation = hashString('annotation|' + seed);
    var seedStatus = hashString('status|' + seed);
    var year = 2032 + (seedDate % 28);
    var month = (seedDate >>> 8) % 12;
    var day = 1 + ((seedDate >>> 16) % 27);
    var hour = (seedDate >>> 4) % 24;
    var minute = (seedDate >>> 12) % 60;
    var signal = Math.min(100, Math.round(((seedStatus % 100) * 0.55) + (strange * 0.45)));
    var origin = choose(ORIGINS, seedOrigin);
    var note = choose(FIELD_NOTES, seedNote);
    var annotation = choose(ANNOTATIONS, seedAnnotation);
    var id = ('FR-' + config.short + '-' + seed.toString(16).toUpperCase()).slice(0, 24);
    var title = titleFor(typeKey, subject);
    var subtitle = choose(config.subtitles, seedStatus);
    var interpretation = note + ' ' + annotation;
    var random = seededRandom(hashString('matrix|' + seed));
    var pattern = [];
    for (var i = 0; i < 49; i += 1) pattern.push(random() > (strange > 75 ? 0.42 : 0.56));
    var dateLabel = pad(day) + ' ' + MONTHS[month] + ' ' + year + ' · ' + pad(hour) + ':' + pad(minute) + ' UTC';
    var code = 'CATALOGUE FR / ' + config.short + ' / ' + year;
    var dossier = [
      'FUTURE RELIC DOSSIER',
      title,
      'ID: ' + id,
      'Recovered: ' + dateLabel,
      'Origin: ' + origin,
      'Status: ' + statusFor(signal),
      'Temporal signal: ' + signal + '%',
      'Field note: ' + interpretation,
      'Generated locally in RunLocal. Classification: fiction.'
    ].join('\n');
    return {
      subject: subject,
      typeKey: typeKey,
      type: config,
      palette: palette,
      seed: seed,
      nonce: roll,
      strangeness: strange,
      signal: signal,
      id: id,
      title: title,
      subtitle: subtitle,
      date: dateLabel,
      year: year,
      origin: origin,
      status: statusFor(signal),
      interpretation: interpretation,
      code: code,
      pattern: pattern,
      dossier: dossier
    };
  }

  function renderPattern(pattern) {
    $('pattern').innerHTML = pattern.map(function (on) {
      return '<i class="' + (on ? 'on' : '') + '"></i>';
    }).join('');
  }

  function updateCharacterCount() {
    $('charCount').textContent = $('seedText').value.length + ' / 160';
  }

  function render(statusMessage) {
    var text = $('seedText').value;
    var typeKey = $('artifactType').value;
    var strange = Number($('strangeness').value);
    var relic = createRelic(text, typeKey, strange, state.nonce);
    state.current = relic;
    $('strangenessValue').textContent = relic.strangeness + '%';
    $('relic').style.setProperty('--relic', relic.palette.accent);
    $('relic').style.setProperty('--relic-soft', relic.palette.soft);
    $('relicType').textContent = relic.type.label.toUpperCase();
    $('relicId').textContent = relic.id;
    $('signalValue').textContent = relic.signal + '%';
    $('signalBar').style.width = relic.signal + '%';
    $('relicTitle').textContent = relic.title;
    $('relicSubtitle').textContent = relic.subtitle;
    $('relicDate').textContent = relic.date;
    $('relicOrigin').textContent = relic.origin;
    $('relicStatus').textContent = relic.status;
    $('relicInterpretation').textContent = relic.interpretation;
    $('artifactCode').textContent = relic.code;
    renderPattern(relic.pattern);
    updateCharacterCount();
    if (statusMessage) $('generatorStatus').textContent = statusMessage;
  }

  function setOutputStatus(message) {
    $('copyStatus').textContent = message;
  }

  function fallbackCopy(text) {
    var field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
    document.body.appendChild(field);
    field.select();
    var copied = false;
    try { copied = document.execCommand('copy'); } catch (error) { copied = false; }
    field.remove();
    if (!copied) throw new Error('Clipboard access was not available');
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      try { fallbackCopy(text); resolve(); } catch (error) { reject(error); }
    });
  }

  function escapeXml(value) {
    return String(value).replace(/[<>&'\"]/g, function (character) {
      return { '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[character];
    });
  }

  function wrapText(value, maxChars, maxLines) {
    var words = String(value).split(/\s+/).filter(Boolean);
    var lines = [];
    var line = '';
    words.forEach(function (word) {
      if (!line) {
        line = word;
      } else if ((line + ' ' + word).length <= maxChars) {
        line += ' ' + word;
      } else {
        lines.push(line);
        line = word;
      }
    });
    if (line) lines.push(line);
    if (lines.length > maxLines) {
      lines = lines.slice(0, maxLines);
      lines[maxLines - 1] = lines[maxLines - 1].slice(0, maxChars - 1) + '…';
    }
    return lines;
  }

  function svgLines(lines, x, y, lineHeight, attrs) {
    return lines.map(function (line, index) {
      return '<text x="' + x + '" y="' + (y + (index * lineHeight)) + '" ' + attrs + '>' + escapeXml(line) + '</text>';
    }).join('');
  }

  function createSvg(relic) {
    var accent = relic.palette.accent;
    var muted = '#8294a4';
    var paper = '#0b131b';
    var titleLines = wrapText(relic.title, 29, 3);
    var subtitleLines = wrapText(relic.subtitle, 58, 2);
    var originLines = wrapText(relic.origin, 24, 2);
    var noteLines = wrapText(relic.interpretation, 78, 4);
    var cells = relic.pattern.map(function (on, index) {
      var x = 914 + ((index % 7) * 28);
      var y = 50 + (Math.floor(index / 7) * 28);
      return '<rect x="' + x + '" y="' + y + '" width="18" height="18" rx="2" fill="' + (on ? accent : 'transparent') + '"/>';
    }).join('');
    return [
      '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="760" viewBox="0 0 1200 760" role="img" aria-labelledby="title desc">',
      '<title id="title">' + escapeXml(relic.title) + '</title>',
      '<desc id="desc">' + escapeXml(relic.dossier) + '</desc>',
      '<rect width="1200" height="760" fill="' + paper + '"/>',
      '<path d="M0 0H1200V760H0Z" fill="none" stroke="#2a3745" stroke-width="2"/>',
      '<path d="M32 32H1168V728H32Z" fill="none" stroke="' + accent + '" stroke-opacity=".5"/>',
      '<g stroke="#263340" stroke-width="1" opacity=".42">',
      '<path d="M32 96H1168M32 610H1168M750 32V610"/>',
      '<path d="M32 152H750M32 208H750M32 264H750M32 320H750M32 376H750M32 432H750M32 488H750M32 544H750"/>',
      '</g>',
      '<text x="64" y="68" fill="' + accent + '" font-family="monospace" font-size="15" letter-spacing="3">' + escapeXml(relic.type.label.toUpperCase()) + '</text>',
      '<text x="64" y="92" fill="' + muted + '" font-family="monospace" font-size="13" letter-spacing="2">' + escapeXml(relic.id) + '</text>',
      '<g transform="translate(902 42)">' + cells + '</g>',
      svgLines(titleLines, 64, 196, 57, 'fill="#e8edf2" font-family="Arial,sans-serif" font-size="48" font-weight="700" letter-spacing="-2"'),
      svgLines(subtitleLines, 66, 315, 24, 'fill="' + muted + '" font-family="Arial,sans-serif" font-size="18"'),
      '<line x1="64" y1="380" x2="700" y2="380" stroke="#2a3745"/>',
      '<text x="64" y="420" fill="' + muted + '" font-family="monospace" font-size="12" letter-spacing="2">RECOVERED</text>',
      '<text x="64" y="446" fill="#e8edf2" font-family="monospace" font-size="16">' + escapeXml(relic.date) + '</text>',
      '<text x="64" y="498" fill="' + muted + '" font-family="monospace" font-size="12" letter-spacing="2">STATUS</text>',
      '<text x="64" y="524" fill="' + accent + '" font-family="monospace" font-size="16">' + escapeXml(relic.status) + '</text>',
      '<text x="64" y="578" fill="' + muted + '" font-family="monospace" font-size="12" letter-spacing="2">TEMPORAL SIGNAL</text>',
      '<rect x="64" y="592" width="540" height="6" rx="3" fill="#263340"/>',
      '<rect x="64" y="592" width="' + (540 * relic.signal / 100) + '" height="6" rx="3" fill="' + accent + '"/>',
      '<text x="64" y="625" fill="' + accent + '" font-family="monospace" font-size="13">' + relic.signal + '%</text>',
      '<line x1="64" y1="650" x2="700" y2="650" stroke="#2a3745"/>',
      svgLines(originLines, 64, 680, 20, 'fill="#b7c4ce" font-family="monospace" font-size="14"'),
      '<line x1="790" y1="380" x2="1120" y2="380" stroke="#2a3745"/>',
      '<text x="790" y="420" fill="' + muted + '" font-family="monospace" font-size="12" letter-spacing="2">ORIGIN</text>',
      svgLines(originLines, 790, 450, 22, 'fill="#e8edf2" font-family="Arial,sans-serif" font-size="16"'),
      '<text x="790" y="520" fill="' + muted + '" font-family="monospace" font-size="12" letter-spacing="2">FIELD NOTE</text>',
      svgLines(noteLines, 790, 550, 21, 'fill="#d8e0e7" font-family="Arial,sans-serif" font-size="15"'),
      '<text x="64" y="716" fill="#718392" font-family="monospace" font-size="11" letter-spacing="2">' + escapeXml(relic.code) + '</text>',
      '<text x="950" y="716" fill="#718392" font-family="monospace" font-size="11" letter-spacing="2">PROPERTY OF THE UNKNOWN</text>',
      '</svg>'
    ].join('');
  }

  function download(filename, content, mime) {
    var blob = new Blob([content], { type: mime });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  function randomPrompt() {
    if (window.crypto && window.crypto.getRandomValues) {
      var values = new Uint32Array(1);
      window.crypto.getRandomValues(values);
      return PROMPTS[values[0] % PROMPTS.length];
    }
    return PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
  }

  function bindEvents() {
    $('seedText').addEventListener('input', function () {
      render('Live preview refreshed from the local specimen.');
    });
    $('artifactType').addEventListener('change', function () {
      render('Artifact format changed. The evidence remains equally fictional.');
    });
    $('strangeness').addEventListener('input', function () {
      render('Strange-o-meter adjusted. Reality is now approximately ' + $('strangeness').value + '%.');
    });
    $('forgeBtn').addEventListener('click', function () {
      state.nonce = 1;
      render('Canonical timeline forged. Identical input, identical artifact.');
    });
    $('rerollBtn').addEventListener('click', function () {
      state.nonce += 1;
      render('Timeline ' + state.nonce + ' opened. Please do not adjust the artifacts.');
    });
    $('surpriseBtn').addEventListener('click', function () {
      $('seedText').value = randomPrompt();
      var types = Object.keys(TYPES);
      $('artifactType').value = types[Math.floor(Math.random() * types.length)];
      $('strangeness').value = Math.floor(Math.random() * 101);
      state.nonce = 1;
      render('A new impossibility has been assigned to your browser.');
    });
    $('copyBtn').addEventListener('click', function () {
      if (!state.current) return;
      copyText(state.current.dossier).then(function () {
        setOutputStatus('Dossier copied. It is now legally useless in at least four timelines.');
      }).catch(function () {
        setOutputStatus('The clipboard declined to participate. You can still download the SVG.');
      });
    });
    $('svgBtn').addEventListener('click', function () {
      if (!state.current) return;
      var filename = 'future-relic-' + state.current.id.toLowerCase() + '.svg';
      download(filename, createSvg(state.current), 'image/svg+xml;charset=utf-8');
      setOutputStatus('SVG exported. It stays sharp even when the timeline does not.');
    });
    $('shareBtn').addEventListener('click', function () {
      if (!state.current) return;
      var relic = state.current;
      if (navigator.share) {
        navigator.share({ title: 'Future Relic: ' + relic.title, text: relic.dossier, url: window.location.href }).then(function () {
          setOutputStatus('Artifact offered to the timeline-sharing machine.');
        }).catch(function (error) {
          if (error && error.name !== 'AbortError') setOutputStatus('The artifact declined to be shared.');
        });
      } else {
        copyText(relic.dossier).then(function () {
          setOutputStatus('Sharing is unavailable here, so the dossier was copied instead.');
        }).catch(function () {
          setOutputStatus('Sharing is unavailable here. Download the SVG to keep the artifact.');
        });
      }
    });
  }

  window.FutureRelic = {
    create: createRelic,
    svg: createSvg
  };

  bindEvents();
  render('A specimen is waiting to be misinterpreted.');
})();
