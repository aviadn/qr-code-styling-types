(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["QRCodeStyling"] = factory();
	else
		root["QRCodeStyling"] = factory();
})(self, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/qrcode-generator/qrcode.js":
/*!*************************************************!*\
  !*** ./node_modules/qrcode-generator/qrcode.js ***!
  \*************************************************/
/***/ ((module, exports) => {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;//---------------------------------------------------------------------
//
// QR Code Generator for JavaScript
//
// Copyright (c) 2009 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//  http://www.opensource.org/licenses/mit-license.php
//
// The word 'QR Code' is registered trademark of
// DENSO WAVE INCORPORATED
//  http://www.denso-wave.com/qrcode/faqpatent-e.html
//
//---------------------------------------------------------------------

var qrcode = function() {

  //---------------------------------------------------------------------
  // qrcode
  //---------------------------------------------------------------------

  /**
   * qrcode
   * @param typeNumber 1 to 40
   * @param errorCorrectionLevel 'L','M','Q','H'
   */
  var qrcode = function(typeNumber, errorCorrectionLevel) {

    var PAD0 = 0xEC;
    var PAD1 = 0x11;

    var _typeNumber = typeNumber;
    var _errorCorrectionLevel = QRErrorCorrectionLevel[errorCorrectionLevel];
    var _modules = null;
    var _moduleCount = 0;
    var _dataCache = null;
    var _dataList = [];

    var _this = {};

    var makeImpl = function(test, maskPattern) {

      _moduleCount = _typeNumber * 4 + 17;
      _modules = function(moduleCount) {
        var modules = new Array(moduleCount);
        for (var row = 0; row < moduleCount; row += 1) {
          modules[row] = new Array(moduleCount);
          for (var col = 0; col < moduleCount; col += 1) {
            modules[row][col] = null;
          }
        }
        return modules;
      }(_moduleCount);

      setupPositionProbePattern(0, 0);
      setupPositionProbePattern(_moduleCount - 7, 0);
      setupPositionProbePattern(0, _moduleCount - 7);
      setupPositionAdjustPattern();
      setupTimingPattern();
      setupTypeInfo(test, maskPattern);

      if (_typeNumber >= 7) {
        setupTypeNumber(test);
      }

      if (_dataCache == null) {
        _dataCache = createData(_typeNumber, _errorCorrectionLevel, _dataList);
      }

      mapData(_dataCache, maskPattern);
    };

    var setupPositionProbePattern = function(row, col) {

      for (var r = -1; r <= 7; r += 1) {

        if (row + r <= -1 || _moduleCount <= row + r) continue;

        for (var c = -1; c <= 7; c += 1) {

          if (col + c <= -1 || _moduleCount <= col + c) continue;

          if ( (0 <= r && r <= 6 && (c == 0 || c == 6) )
              || (0 <= c && c <= 6 && (r == 0 || r == 6) )
              || (2 <= r && r <= 4 && 2 <= c && c <= 4) ) {
            _modules[row + r][col + c] = true;
          } else {
            _modules[row + r][col + c] = false;
          }
        }
      }
    };

    var getBestMaskPattern = function() {

      var minLostPoint = 0;
      var pattern = 0;

      for (var i = 0; i < 8; i += 1) {

        makeImpl(true, i);

        var lostPoint = QRUtil.getLostPoint(_this);

        if (i == 0 || minLostPoint > lostPoint) {
          minLostPoint = lostPoint;
          pattern = i;
        }
      }

      return pattern;
    };

    var setupTimingPattern = function() {

      for (var r = 8; r < _moduleCount - 8; r += 1) {
        if (_modules[r][6] != null) {
          continue;
        }
        _modules[r][6] = (r % 2 == 0);
      }

      for (var c = 8; c < _moduleCount - 8; c += 1) {
        if (_modules[6][c] != null) {
          continue;
        }
        _modules[6][c] = (c % 2 == 0);
      }
    };

    var setupPositionAdjustPattern = function() {

      var pos = QRUtil.getPatternPosition(_typeNumber);

      for (var i = 0; i < pos.length; i += 1) {

        for (var j = 0; j < pos.length; j += 1) {

          var row = pos[i];
          var col = pos[j];

          if (_modules[row][col] != null) {
            continue;
          }

          for (var r = -2; r <= 2; r += 1) {

            for (var c = -2; c <= 2; c += 1) {

              if (r == -2 || r == 2 || c == -2 || c == 2
                  || (r == 0 && c == 0) ) {
                _modules[row + r][col + c] = true;
              } else {
                _modules[row + r][col + c] = false;
              }
            }
          }
        }
      }
    };

    var setupTypeNumber = function(test) {

      var bits = QRUtil.getBCHTypeNumber(_typeNumber);

      for (var i = 0; i < 18; i += 1) {
        var mod = (!test && ( (bits >> i) & 1) == 1);
        _modules[Math.floor(i / 3)][i % 3 + _moduleCount - 8 - 3] = mod;
      }

      for (var i = 0; i < 18; i += 1) {
        var mod = (!test && ( (bits >> i) & 1) == 1);
        _modules[i % 3 + _moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
      }
    };

    var setupTypeInfo = function(test, maskPattern) {

      var data = (_errorCorrectionLevel << 3) | maskPattern;
      var bits = QRUtil.getBCHTypeInfo(data);

      // vertical
      for (var i = 0; i < 15; i += 1) {

        var mod = (!test && ( (bits >> i) & 1) == 1);

        if (i < 6) {
          _modules[i][8] = mod;
        } else if (i < 8) {
          _modules[i + 1][8] = mod;
        } else {
          _modules[_moduleCount - 15 + i][8] = mod;
        }
      }

      // horizontal
      for (var i = 0; i < 15; i += 1) {

        var mod = (!test && ( (bits >> i) & 1) == 1);

        if (i < 8) {
          _modules[8][_moduleCount - i - 1] = mod;
        } else if (i < 9) {
          _modules[8][15 - i - 1 + 1] = mod;
        } else {
          _modules[8][15 - i - 1] = mod;
        }
      }

      // fixed module
      _modules[_moduleCount - 8][8] = (!test);
    };

    var mapData = function(data, maskPattern) {

      var inc = -1;
      var row = _moduleCount - 1;
      var bitIndex = 7;
      var byteIndex = 0;
      var maskFunc = QRUtil.getMaskFunction(maskPattern);

      for (var col = _moduleCount - 1; col > 0; col -= 2) {

        if (col == 6) col -= 1;

        while (true) {

          for (var c = 0; c < 2; c += 1) {

            if (_modules[row][col - c] == null) {

              var dark = false;

              if (byteIndex < data.length) {
                dark = ( ( (data[byteIndex] >>> bitIndex) & 1) == 1);
              }

              var mask = maskFunc(row, col - c);

              if (mask) {
                dark = !dark;
              }

              _modules[row][col - c] = dark;
              bitIndex -= 1;

              if (bitIndex == -1) {
                byteIndex += 1;
                bitIndex = 7;
              }
            }
          }

          row += inc;

          if (row < 0 || _moduleCount <= row) {
            row -= inc;
            inc = -inc;
            break;
          }
        }
      }
    };

    var createBytes = function(buffer, rsBlocks) {

      var offset = 0;

      var maxDcCount = 0;
      var maxEcCount = 0;

      var dcdata = new Array(rsBlocks.length);
      var ecdata = new Array(rsBlocks.length);

      for (var r = 0; r < rsBlocks.length; r += 1) {

        var dcCount = rsBlocks[r].dataCount;
        var ecCount = rsBlocks[r].totalCount - dcCount;

        maxDcCount = Math.max(maxDcCount, dcCount);
        maxEcCount = Math.max(maxEcCount, ecCount);

        dcdata[r] = new Array(dcCount);

        for (var i = 0; i < dcdata[r].length; i += 1) {
          dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset];
        }
        offset += dcCount;

        var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
        var rawPoly = qrPolynomial(dcdata[r], rsPoly.getLength() - 1);

        var modPoly = rawPoly.mod(rsPoly);
        ecdata[r] = new Array(rsPoly.getLength() - 1);
        for (var i = 0; i < ecdata[r].length; i += 1) {
          var modIndex = i + modPoly.getLength() - ecdata[r].length;
          ecdata[r][i] = (modIndex >= 0)? modPoly.getAt(modIndex) : 0;
        }
      }

      var totalCodeCount = 0;
      for (var i = 0; i < rsBlocks.length; i += 1) {
        totalCodeCount += rsBlocks[i].totalCount;
      }

      var data = new Array(totalCodeCount);
      var index = 0;

      for (var i = 0; i < maxDcCount; i += 1) {
        for (var r = 0; r < rsBlocks.length; r += 1) {
          if (i < dcdata[r].length) {
            data[index] = dcdata[r][i];
            index += 1;
          }
        }
      }

      for (var i = 0; i < maxEcCount; i += 1) {
        for (var r = 0; r < rsBlocks.length; r += 1) {
          if (i < ecdata[r].length) {
            data[index] = ecdata[r][i];
            index += 1;
          }
        }
      }

      return data;
    };

    var createData = function(typeNumber, errorCorrectionLevel, dataList) {

      var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectionLevel);

      var buffer = qrBitBuffer();

      for (var i = 0; i < dataList.length; i += 1) {
        var data = dataList[i];
        buffer.put(data.getMode(), 4);
        buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
        data.write(buffer);
      }

      // calc num max data.
      var totalDataCount = 0;
      for (var i = 0; i < rsBlocks.length; i += 1) {
        totalDataCount += rsBlocks[i].dataCount;
      }

      if (buffer.getLengthInBits() > totalDataCount * 8) {
        throw 'code length overflow. ('
          + buffer.getLengthInBits()
          + '>'
          + totalDataCount * 8
          + ')';
      }

      // end code
      if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
        buffer.put(0, 4);
      }

      // padding
      while (buffer.getLengthInBits() % 8 != 0) {
        buffer.putBit(false);
      }

      // padding
      while (true) {

        if (buffer.getLengthInBits() >= totalDataCount * 8) {
          break;
        }
        buffer.put(PAD0, 8);

        if (buffer.getLengthInBits() >= totalDataCount * 8) {
          break;
        }
        buffer.put(PAD1, 8);
      }

      return createBytes(buffer, rsBlocks);
    };

    _this.addData = function(data, mode) {

      mode = mode || 'Byte';

      var newData = null;

      switch(mode) {
      case 'Numeric' :
        newData = qrNumber(data);
        break;
      case 'Alphanumeric' :
        newData = qrAlphaNum(data);
        break;
      case 'Byte' :
        newData = qr8BitByte(data);
        break;
      case 'Kanji' :
        newData = qrKanji(data);
        break;
      default :
        throw 'mode:' + mode;
      }

      _dataList.push(newData);
      _dataCache = null;
    };

    _this.isDark = function(row, col) {
      if (row < 0 || _moduleCount <= row || col < 0 || _moduleCount <= col) {
        throw row + ',' + col;
      }
      return _modules[row][col];
    };

    _this.getModuleCount = function() {
      return _moduleCount;
    };

    _this.make = function() {
      if (_typeNumber < 1) {
        var typeNumber = 1;

        for (; typeNumber < 40; typeNumber++) {
          var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, _errorCorrectionLevel);
          var buffer = qrBitBuffer();

          for (var i = 0; i < _dataList.length; i++) {
            var data = _dataList[i];
            buffer.put(data.getMode(), 4);
            buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
            data.write(buffer);
          }

          var totalDataCount = 0;
          for (var i = 0; i < rsBlocks.length; i++) {
            totalDataCount += rsBlocks[i].dataCount;
          }

          if (buffer.getLengthInBits() <= totalDataCount * 8) {
            break;
          }
        }

        _typeNumber = typeNumber;
      }

      makeImpl(false, getBestMaskPattern() );
    };

    _this.createTableTag = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var qrHtml = '';

      qrHtml += '<table style="';
      qrHtml += ' border-width: 0px; border-style: none;';
      qrHtml += ' border-collapse: collapse;';
      qrHtml += ' padding: 0px; margin: ' + margin + 'px;';
      qrHtml += '">';
      qrHtml += '<tbody>';

      for (var r = 0; r < _this.getModuleCount(); r += 1) {

        qrHtml += '<tr>';

        for (var c = 0; c < _this.getModuleCount(); c += 1) {
          qrHtml += '<td style="';
          qrHtml += ' border-width: 0px; border-style: none;';
          qrHtml += ' border-collapse: collapse;';
          qrHtml += ' padding: 0px; margin: 0px;';
          qrHtml += ' width: ' + cellSize + 'px;';
          qrHtml += ' height: ' + cellSize + 'px;';
          qrHtml += ' background-color: ';
          qrHtml += _this.isDark(r, c)? '#000000' : '#ffffff';
          qrHtml += ';';
          qrHtml += '"/>';
        }

        qrHtml += '</tr>';
      }

      qrHtml += '</tbody>';
      qrHtml += '</table>';

      return qrHtml;
    };

    _this.createSvgTag = function(cellSize, margin, alt, title) {

      var opts = {};
      if (typeof arguments[0] == 'object') {
        // Called by options.
        opts = arguments[0];
        // overwrite cellSize and margin.
        cellSize = opts.cellSize;
        margin = opts.margin;
        alt = opts.alt;
        title = opts.title;
      }

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      // Compose alt property surrogate
      alt = (typeof alt === 'string') ? {text: alt} : alt || {};
      alt.text = alt.text || null;
      alt.id = (alt.text) ? alt.id || 'qrcode-description' : null;

      // Compose title property surrogate
      title = (typeof title === 'string') ? {text: title} : title || {};
      title.text = title.text || null;
      title.id = (title.text) ? title.id || 'qrcode-title' : null;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var c, mc, r, mr, qrSvg='', rect;

      rect = 'l' + cellSize + ',0 0,' + cellSize +
        ' -' + cellSize + ',0 0,-' + cellSize + 'z ';

      qrSvg += '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"';
      qrSvg += !opts.scalable ? ' width="' + size + 'px" height="' + size + 'px"' : '';
      qrSvg += ' viewBox="0 0 ' + size + ' ' + size + '" ';
      qrSvg += ' preserveAspectRatio="xMinYMin meet"';
      qrSvg += (title.text || alt.text) ? ' role="img" aria-labelledby="' +
          escapeXml([title.id, alt.id].join(' ').trim() ) + '"' : '';
      qrSvg += '>';
      qrSvg += (title.text) ? '<title id="' + escapeXml(title.id) + '">' +
          escapeXml(title.text) + '</title>' : '';
      qrSvg += (alt.text) ? '<description id="' + escapeXml(alt.id) + '">' +
          escapeXml(alt.text) + '</description>' : '';
      qrSvg += '<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>';
      qrSvg += '<path d="';

      for (r = 0; r < _this.getModuleCount(); r += 1) {
        mr = r * cellSize + margin;
        for (c = 0; c < _this.getModuleCount(); c += 1) {
          if (_this.isDark(r, c) ) {
            mc = c*cellSize+margin;
            qrSvg += 'M' + mc + ',' + mr + rect;
          }
        }
      }

      qrSvg += '" stroke="transparent" fill="black"/>';
      qrSvg += '</svg>';

      return qrSvg;
    };

    _this.createDataURL = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      return createDataURL(size, size, function(x, y) {
        if (min <= x && x < max && min <= y && y < max) {
          var c = Math.floor( (x - min) / cellSize);
          var r = Math.floor( (y - min) / cellSize);
          return _this.isDark(r, c)? 0 : 1;
        } else {
          return 1;
        }
      } );
    };

    _this.createImgTag = function(cellSize, margin, alt) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;

      var img = '';
      img += '<img';
      img += '\u0020src="';
      img += _this.createDataURL(cellSize, margin);
      img += '"';
      img += '\u0020width="';
      img += size;
      img += '"';
      img += '\u0020height="';
      img += size;
      img += '"';
      if (alt) {
        img += '\u0020alt="';
        img += escapeXml(alt);
        img += '"';
      }
      img += '/>';

      return img;
    };

    var escapeXml = function(s) {
      var escaped = '';
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charAt(i);
        switch(c) {
        case '<': escaped += '&lt;'; break;
        case '>': escaped += '&gt;'; break;
        case '&': escaped += '&amp;'; break;
        case '"': escaped += '&quot;'; break;
        default : escaped += c; break;
        }
      }
      return escaped;
    };

    var _createHalfASCII = function(margin) {
      var cellSize = 1;
      margin = (typeof margin == 'undefined')? cellSize * 2 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      var y, x, r1, r2, p;

      var blocks = {
        '██': '█',
        '█ ': '▀',
        ' █': '▄',
        '  ': ' '
      };

      var blocksLastLineNoMargin = {
        '██': '▀',
        '█ ': '▀',
        ' █': ' ',
        '  ': ' '
      };

      var ascii = '';
      for (y = 0; y < size; y += 2) {
        r1 = Math.floor((y - min) / cellSize);
        r2 = Math.floor((y + 1 - min) / cellSize);
        for (x = 0; x < size; x += 1) {
          p = '█';

          if (min <= x && x < max && min <= y && y < max && _this.isDark(r1, Math.floor((x - min) / cellSize))) {
            p = ' ';
          }

          if (min <= x && x < max && min <= y+1 && y+1 < max && _this.isDark(r2, Math.floor((x - min) / cellSize))) {
            p += ' ';
          }
          else {
            p += '█';
          }

          // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
          ascii += (margin < 1 && y+1 >= max) ? blocksLastLineNoMargin[p] : blocks[p];
        }

        ascii += '\n';
      }

      if (size % 2 && margin > 0) {
        return ascii.substring(0, ascii.length - size - 1) + Array(size+1).join('▀');
      }

      return ascii.substring(0, ascii.length-1);
    };

    _this.createASCII = function(cellSize, margin) {
      cellSize = cellSize || 1;

      if (cellSize < 2) {
        return _createHalfASCII(margin);
      }

      cellSize -= 1;
      margin = (typeof margin == 'undefined')? cellSize * 2 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      var y, x, r, p;

      var white = Array(cellSize+1).join('██');
      var black = Array(cellSize+1).join('  ');

      var ascii = '';
      var line = '';
      for (y = 0; y < size; y += 1) {
        r = Math.floor( (y - min) / cellSize);
        line = '';
        for (x = 0; x < size; x += 1) {
          p = 1;

          if (min <= x && x < max && min <= y && y < max && _this.isDark(r, Math.floor((x - min) / cellSize))) {
            p = 0;
          }

          // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
          line += p ? white : black;
        }

        for (r = 0; r < cellSize; r += 1) {
          ascii += line + '\n';
        }
      }

      return ascii.substring(0, ascii.length-1);
    };

    _this.renderTo2dContext = function(context, cellSize) {
      cellSize = cellSize || 2;
      var length = _this.getModuleCount();
      for (var row = 0; row < length; row++) {
        for (var col = 0; col < length; col++) {
          context.fillStyle = _this.isDark(row, col) ? 'black' : 'white';
          context.fillRect(row * cellSize, col * cellSize, cellSize, cellSize);
        }
      }
    }

    return _this;
  };

  //---------------------------------------------------------------------
  // qrcode.stringToBytes
  //---------------------------------------------------------------------

  qrcode.stringToBytesFuncs = {
    'default' : function(s) {
      var bytes = [];
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charCodeAt(i);
        bytes.push(c & 0xff);
      }
      return bytes;
    }
  };

  qrcode.stringToBytes = qrcode.stringToBytesFuncs['default'];

  //---------------------------------------------------------------------
  // qrcode.createStringToBytes
  //---------------------------------------------------------------------

  /**
   * @param unicodeData base64 string of byte array.
   * [16bit Unicode],[16bit Bytes], ...
   * @param numChars
   */
  qrcode.createStringToBytes = function(unicodeData, numChars) {

    // create conversion map.

    var unicodeMap = function() {

      var bin = base64DecodeInputStream(unicodeData);
      var read = function() {
        var b = bin.read();
        if (b == -1) throw 'eof';
        return b;
      };

      var count = 0;
      var unicodeMap = {};
      while (true) {
        var b0 = bin.read();
        if (b0 == -1) break;
        var b1 = read();
        var b2 = read();
        var b3 = read();
        var k = String.fromCharCode( (b0 << 8) | b1);
        var v = (b2 << 8) | b3;
        unicodeMap[k] = v;
        count += 1;
      }
      if (count != numChars) {
        throw count + ' != ' + numChars;
      }

      return unicodeMap;
    }();

    var unknownChar = '?'.charCodeAt(0);

    return function(s) {
      var bytes = [];
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charCodeAt(i);
        if (c < 128) {
          bytes.push(c);
        } else {
          var b = unicodeMap[s.charAt(i)];
          if (typeof b == 'number') {
            if ( (b & 0xff) == b) {
              // 1byte
              bytes.push(b);
            } else {
              // 2bytes
              bytes.push(b >>> 8);
              bytes.push(b & 0xff);
            }
          } else {
            bytes.push(unknownChar);
          }
        }
      }
      return bytes;
    };
  };

  //---------------------------------------------------------------------
  // QRMode
  //---------------------------------------------------------------------

  var QRMode = {
    MODE_NUMBER :    1 << 0,
    MODE_ALPHA_NUM : 1 << 1,
    MODE_8BIT_BYTE : 1 << 2,
    MODE_KANJI :     1 << 3
  };

  //---------------------------------------------------------------------
  // QRErrorCorrectionLevel
  //---------------------------------------------------------------------

  var QRErrorCorrectionLevel = {
    L : 1,
    M : 0,
    Q : 3,
    H : 2
  };

  //---------------------------------------------------------------------
  // QRMaskPattern
  //---------------------------------------------------------------------

  var QRMaskPattern = {
    PATTERN000 : 0,
    PATTERN001 : 1,
    PATTERN010 : 2,
    PATTERN011 : 3,
    PATTERN100 : 4,
    PATTERN101 : 5,
    PATTERN110 : 6,
    PATTERN111 : 7
  };

  //---------------------------------------------------------------------
  // QRUtil
  //---------------------------------------------------------------------

  var QRUtil = function() {

    var PATTERN_POSITION_TABLE = [
      [],
      [6, 18],
      [6, 22],
      [6, 26],
      [6, 30],
      [6, 34],
      [6, 22, 38],
      [6, 24, 42],
      [6, 26, 46],
      [6, 28, 50],
      [6, 30, 54],
      [6, 32, 58],
      [6, 34, 62],
      [6, 26, 46, 66],
      [6, 26, 48, 70],
      [6, 26, 50, 74],
      [6, 30, 54, 78],
      [6, 30, 56, 82],
      [6, 30, 58, 86],
      [6, 34, 62, 90],
      [6, 28, 50, 72, 94],
      [6, 26, 50, 74, 98],
      [6, 30, 54, 78, 102],
      [6, 28, 54, 80, 106],
      [6, 32, 58, 84, 110],
      [6, 30, 58, 86, 114],
      [6, 34, 62, 90, 118],
      [6, 26, 50, 74, 98, 122],
      [6, 30, 54, 78, 102, 126],
      [6, 26, 52, 78, 104, 130],
      [6, 30, 56, 82, 108, 134],
      [6, 34, 60, 86, 112, 138],
      [6, 30, 58, 86, 114, 142],
      [6, 34, 62, 90, 118, 146],
      [6, 30, 54, 78, 102, 126, 150],
      [6, 24, 50, 76, 102, 128, 154],
      [6, 28, 54, 80, 106, 132, 158],
      [6, 32, 58, 84, 110, 136, 162],
      [6, 26, 54, 82, 110, 138, 166],
      [6, 30, 58, 86, 114, 142, 170]
    ];
    var G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
    var G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
    var G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

    var _this = {};

    var getBCHDigit = function(data) {
      var digit = 0;
      while (data != 0) {
        digit += 1;
        data >>>= 1;
      }
      return digit;
    };

    _this.getBCHTypeInfo = function(data) {
      var d = data << 10;
      while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
        d ^= (G15 << (getBCHDigit(d) - getBCHDigit(G15) ) );
      }
      return ( (data << 10) | d) ^ G15_MASK;
    };

    _this.getBCHTypeNumber = function(data) {
      var d = data << 12;
      while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
        d ^= (G18 << (getBCHDigit(d) - getBCHDigit(G18) ) );
      }
      return (data << 12) | d;
    };

    _this.getPatternPosition = function(typeNumber) {
      return PATTERN_POSITION_TABLE[typeNumber - 1];
    };

    _this.getMaskFunction = function(maskPattern) {

      switch (maskPattern) {

      case QRMaskPattern.PATTERN000 :
        return function(i, j) { return (i + j) % 2 == 0; };
      case QRMaskPattern.PATTERN001 :
        return function(i, j) { return i % 2 == 0; };
      case QRMaskPattern.PATTERN010 :
        return function(i, j) { return j % 3 == 0; };
      case QRMaskPattern.PATTERN011 :
        return function(i, j) { return (i + j) % 3 == 0; };
      case QRMaskPattern.PATTERN100 :
        return function(i, j) { return (Math.floor(i / 2) + Math.floor(j / 3) ) % 2 == 0; };
      case QRMaskPattern.PATTERN101 :
        return function(i, j) { return (i * j) % 2 + (i * j) % 3 == 0; };
      case QRMaskPattern.PATTERN110 :
        return function(i, j) { return ( (i * j) % 2 + (i * j) % 3) % 2 == 0; };
      case QRMaskPattern.PATTERN111 :
        return function(i, j) { return ( (i * j) % 3 + (i + j) % 2) % 2 == 0; };

      default :
        throw 'bad maskPattern:' + maskPattern;
      }
    };

    _this.getErrorCorrectPolynomial = function(errorCorrectLength) {
      var a = qrPolynomial([1], 0);
      for (var i = 0; i < errorCorrectLength; i += 1) {
        a = a.multiply(qrPolynomial([1, QRMath.gexp(i)], 0) );
      }
      return a;
    };

    _this.getLengthInBits = function(mode, type) {

      if (1 <= type && type < 10) {

        // 1 - 9

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 10;
        case QRMode.MODE_ALPHA_NUM : return 9;
        case QRMode.MODE_8BIT_BYTE : return 8;
        case QRMode.MODE_KANJI     : return 8;
        default :
          throw 'mode:' + mode;
        }

      } else if (type < 27) {

        // 10 - 26

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 12;
        case QRMode.MODE_ALPHA_NUM : return 11;
        case QRMode.MODE_8BIT_BYTE : return 16;
        case QRMode.MODE_KANJI     : return 10;
        default :
          throw 'mode:' + mode;
        }

      } else if (type < 41) {

        // 27 - 40

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 14;
        case QRMode.MODE_ALPHA_NUM : return 13;
        case QRMode.MODE_8BIT_BYTE : return 16;
        case QRMode.MODE_KANJI     : return 12;
        default :
          throw 'mode:' + mode;
        }

      } else {
        throw 'type:' + type;
      }
    };

    _this.getLostPoint = function(qrcode) {

      var moduleCount = qrcode.getModuleCount();

      var lostPoint = 0;

      // LEVEL1

      for (var row = 0; row < moduleCount; row += 1) {
        for (var col = 0; col < moduleCount; col += 1) {

          var sameCount = 0;
          var dark = qrcode.isDark(row, col);

          for (var r = -1; r <= 1; r += 1) {

            if (row + r < 0 || moduleCount <= row + r) {
              continue;
            }

            for (var c = -1; c <= 1; c += 1) {

              if (col + c < 0 || moduleCount <= col + c) {
                continue;
              }

              if (r == 0 && c == 0) {
                continue;
              }

              if (dark == qrcode.isDark(row + r, col + c) ) {
                sameCount += 1;
              }
            }
          }

          if (sameCount > 5) {
            lostPoint += (3 + sameCount - 5);
          }
        }
      };

      // LEVEL2

      for (var row = 0; row < moduleCount - 1; row += 1) {
        for (var col = 0; col < moduleCount - 1; col += 1) {
          var count = 0;
          if (qrcode.isDark(row, col) ) count += 1;
          if (qrcode.isDark(row + 1, col) ) count += 1;
          if (qrcode.isDark(row, col + 1) ) count += 1;
          if (qrcode.isDark(row + 1, col + 1) ) count += 1;
          if (count == 0 || count == 4) {
            lostPoint += 3;
          }
        }
      }

      // LEVEL3

      for (var row = 0; row < moduleCount; row += 1) {
        for (var col = 0; col < moduleCount - 6; col += 1) {
          if (qrcode.isDark(row, col)
              && !qrcode.isDark(row, col + 1)
              &&  qrcode.isDark(row, col + 2)
              &&  qrcode.isDark(row, col + 3)
              &&  qrcode.isDark(row, col + 4)
              && !qrcode.isDark(row, col + 5)
              &&  qrcode.isDark(row, col + 6) ) {
            lostPoint += 40;
          }
        }
      }

      for (var col = 0; col < moduleCount; col += 1) {
        for (var row = 0; row < moduleCount - 6; row += 1) {
          if (qrcode.isDark(row, col)
              && !qrcode.isDark(row + 1, col)
              &&  qrcode.isDark(row + 2, col)
              &&  qrcode.isDark(row + 3, col)
              &&  qrcode.isDark(row + 4, col)
              && !qrcode.isDark(row + 5, col)
              &&  qrcode.isDark(row + 6, col) ) {
            lostPoint += 40;
          }
        }
      }

      // LEVEL4

      var darkCount = 0;

      for (var col = 0; col < moduleCount; col += 1) {
        for (var row = 0; row < moduleCount; row += 1) {
          if (qrcode.isDark(row, col) ) {
            darkCount += 1;
          }
        }
      }

      var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
      lostPoint += ratio * 10;

      return lostPoint;
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // QRMath
  //---------------------------------------------------------------------

  var QRMath = function() {

    var EXP_TABLE = new Array(256);
    var LOG_TABLE = new Array(256);

    // initialize tables
    for (var i = 0; i < 8; i += 1) {
      EXP_TABLE[i] = 1 << i;
    }
    for (var i = 8; i < 256; i += 1) {
      EXP_TABLE[i] = EXP_TABLE[i - 4]
        ^ EXP_TABLE[i - 5]
        ^ EXP_TABLE[i - 6]
        ^ EXP_TABLE[i - 8];
    }
    for (var i = 0; i < 255; i += 1) {
      LOG_TABLE[EXP_TABLE[i] ] = i;
    }

    var _this = {};

    _this.glog = function(n) {

      if (n < 1) {
        throw 'glog(' + n + ')';
      }

      return LOG_TABLE[n];
    };

    _this.gexp = function(n) {

      while (n < 0) {
        n += 255;
      }

      while (n >= 256) {
        n -= 255;
      }

      return EXP_TABLE[n];
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // qrPolynomial
  //---------------------------------------------------------------------

  function qrPolynomial(num, shift) {

    if (typeof num.length == 'undefined') {
      throw num.length + '/' + shift;
    }

    var _num = function() {
      var offset = 0;
      while (offset < num.length && num[offset] == 0) {
        offset += 1;
      }
      var _num = new Array(num.length - offset + shift);
      for (var i = 0; i < num.length - offset; i += 1) {
        _num[i] = num[i + offset];
      }
      return _num;
    }();

    var _this = {};

    _this.getAt = function(index) {
      return _num[index];
    };

    _this.getLength = function() {
      return _num.length;
    };

    _this.multiply = function(e) {

      var num = new Array(_this.getLength() + e.getLength() - 1);

      for (var i = 0; i < _this.getLength(); i += 1) {
        for (var j = 0; j < e.getLength(); j += 1) {
          num[i + j] ^= QRMath.gexp(QRMath.glog(_this.getAt(i) ) + QRMath.glog(e.getAt(j) ) );
        }
      }

      return qrPolynomial(num, 0);
    };

    _this.mod = function(e) {

      if (_this.getLength() - e.getLength() < 0) {
        return _this;
      }

      var ratio = QRMath.glog(_this.getAt(0) ) - QRMath.glog(e.getAt(0) );

      var num = new Array(_this.getLength() );
      for (var i = 0; i < _this.getLength(); i += 1) {
        num[i] = _this.getAt(i);
      }

      for (var i = 0; i < e.getLength(); i += 1) {
        num[i] ^= QRMath.gexp(QRMath.glog(e.getAt(i) ) + ratio);
      }

      // recursive call
      return qrPolynomial(num, 0).mod(e);
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // QRRSBlock
  //---------------------------------------------------------------------

  var QRRSBlock = function() {

    var RS_BLOCK_TABLE = [

      // L
      // M
      // Q
      // H

      // 1
      [1, 26, 19],
      [1, 26, 16],
      [1, 26, 13],
      [1, 26, 9],

      // 2
      [1, 44, 34],
      [1, 44, 28],
      [1, 44, 22],
      [1, 44, 16],

      // 3
      [1, 70, 55],
      [1, 70, 44],
      [2, 35, 17],
      [2, 35, 13],

      // 4
      [1, 100, 80],
      [2, 50, 32],
      [2, 50, 24],
      [4, 25, 9],

      // 5
      [1, 134, 108],
      [2, 67, 43],
      [2, 33, 15, 2, 34, 16],
      [2, 33, 11, 2, 34, 12],

      // 6
      [2, 86, 68],
      [4, 43, 27],
      [4, 43, 19],
      [4, 43, 15],

      // 7
      [2, 98, 78],
      [4, 49, 31],
      [2, 32, 14, 4, 33, 15],
      [4, 39, 13, 1, 40, 14],

      // 8
      [2, 121, 97],
      [2, 60, 38, 2, 61, 39],
      [4, 40, 18, 2, 41, 19],
      [4, 40, 14, 2, 41, 15],

      // 9
      [2, 146, 116],
      [3, 58, 36, 2, 59, 37],
      [4, 36, 16, 4, 37, 17],
      [4, 36, 12, 4, 37, 13],

      // 10
      [2, 86, 68, 2, 87, 69],
      [4, 69, 43, 1, 70, 44],
      [6, 43, 19, 2, 44, 20],
      [6, 43, 15, 2, 44, 16],

      // 11
      [4, 101, 81],
      [1, 80, 50, 4, 81, 51],
      [4, 50, 22, 4, 51, 23],
      [3, 36, 12, 8, 37, 13],

      // 12
      [2, 116, 92, 2, 117, 93],
      [6, 58, 36, 2, 59, 37],
      [4, 46, 20, 6, 47, 21],
      [7, 42, 14, 4, 43, 15],

      // 13
      [4, 133, 107],
      [8, 59, 37, 1, 60, 38],
      [8, 44, 20, 4, 45, 21],
      [12, 33, 11, 4, 34, 12],

      // 14
      [3, 145, 115, 1, 146, 116],
      [4, 64, 40, 5, 65, 41],
      [11, 36, 16, 5, 37, 17],
      [11, 36, 12, 5, 37, 13],

      // 15
      [5, 109, 87, 1, 110, 88],
      [5, 65, 41, 5, 66, 42],
      [5, 54, 24, 7, 55, 25],
      [11, 36, 12, 7, 37, 13],

      // 16
      [5, 122, 98, 1, 123, 99],
      [7, 73, 45, 3, 74, 46],
      [15, 43, 19, 2, 44, 20],
      [3, 45, 15, 13, 46, 16],

      // 17
      [1, 135, 107, 5, 136, 108],
      [10, 74, 46, 1, 75, 47],
      [1, 50, 22, 15, 51, 23],
      [2, 42, 14, 17, 43, 15],

      // 18
      [5, 150, 120, 1, 151, 121],
      [9, 69, 43, 4, 70, 44],
      [17, 50, 22, 1, 51, 23],
      [2, 42, 14, 19, 43, 15],

      // 19
      [3, 141, 113, 4, 142, 114],
      [3, 70, 44, 11, 71, 45],
      [17, 47, 21, 4, 48, 22],
      [9, 39, 13, 16, 40, 14],

      // 20
      [3, 135, 107, 5, 136, 108],
      [3, 67, 41, 13, 68, 42],
      [15, 54, 24, 5, 55, 25],
      [15, 43, 15, 10, 44, 16],

      // 21
      [4, 144, 116, 4, 145, 117],
      [17, 68, 42],
      [17, 50, 22, 6, 51, 23],
      [19, 46, 16, 6, 47, 17],

      // 22
      [2, 139, 111, 7, 140, 112],
      [17, 74, 46],
      [7, 54, 24, 16, 55, 25],
      [34, 37, 13],

      // 23
      [4, 151, 121, 5, 152, 122],
      [4, 75, 47, 14, 76, 48],
      [11, 54, 24, 14, 55, 25],
      [16, 45, 15, 14, 46, 16],

      // 24
      [6, 147, 117, 4, 148, 118],
      [6, 73, 45, 14, 74, 46],
      [11, 54, 24, 16, 55, 25],
      [30, 46, 16, 2, 47, 17],

      // 25
      [8, 132, 106, 4, 133, 107],
      [8, 75, 47, 13, 76, 48],
      [7, 54, 24, 22, 55, 25],
      [22, 45, 15, 13, 46, 16],

      // 26
      [10, 142, 114, 2, 143, 115],
      [19, 74, 46, 4, 75, 47],
      [28, 50, 22, 6, 51, 23],
      [33, 46, 16, 4, 47, 17],

      // 27
      [8, 152, 122, 4, 153, 123],
      [22, 73, 45, 3, 74, 46],
      [8, 53, 23, 26, 54, 24],
      [12, 45, 15, 28, 46, 16],

      // 28
      [3, 147, 117, 10, 148, 118],
      [3, 73, 45, 23, 74, 46],
      [4, 54, 24, 31, 55, 25],
      [11, 45, 15, 31, 46, 16],

      // 29
      [7, 146, 116, 7, 147, 117],
      [21, 73, 45, 7, 74, 46],
      [1, 53, 23, 37, 54, 24],
      [19, 45, 15, 26, 46, 16],

      // 30
      [5, 145, 115, 10, 146, 116],
      [19, 75, 47, 10, 76, 48],
      [15, 54, 24, 25, 55, 25],
      [23, 45, 15, 25, 46, 16],

      // 31
      [13, 145, 115, 3, 146, 116],
      [2, 74, 46, 29, 75, 47],
      [42, 54, 24, 1, 55, 25],
      [23, 45, 15, 28, 46, 16],

      // 32
      [17, 145, 115],
      [10, 74, 46, 23, 75, 47],
      [10, 54, 24, 35, 55, 25],
      [19, 45, 15, 35, 46, 16],

      // 33
      [17, 145, 115, 1, 146, 116],
      [14, 74, 46, 21, 75, 47],
      [29, 54, 24, 19, 55, 25],
      [11, 45, 15, 46, 46, 16],

      // 34
      [13, 145, 115, 6, 146, 116],
      [14, 74, 46, 23, 75, 47],
      [44, 54, 24, 7, 55, 25],
      [59, 46, 16, 1, 47, 17],

      // 35
      [12, 151, 121, 7, 152, 122],
      [12, 75, 47, 26, 76, 48],
      [39, 54, 24, 14, 55, 25],
      [22, 45, 15, 41, 46, 16],

      // 36
      [6, 151, 121, 14, 152, 122],
      [6, 75, 47, 34, 76, 48],
      [46, 54, 24, 10, 55, 25],
      [2, 45, 15, 64, 46, 16],

      // 37
      [17, 152, 122, 4, 153, 123],
      [29, 74, 46, 14, 75, 47],
      [49, 54, 24, 10, 55, 25],
      [24, 45, 15, 46, 46, 16],

      // 38
      [4, 152, 122, 18, 153, 123],
      [13, 74, 46, 32, 75, 47],
      [48, 54, 24, 14, 55, 25],
      [42, 45, 15, 32, 46, 16],

      // 39
      [20, 147, 117, 4, 148, 118],
      [40, 75, 47, 7, 76, 48],
      [43, 54, 24, 22, 55, 25],
      [10, 45, 15, 67, 46, 16],

      // 40
      [19, 148, 118, 6, 149, 119],
      [18, 75, 47, 31, 76, 48],
      [34, 54, 24, 34, 55, 25],
      [20, 45, 15, 61, 46, 16]
    ];

    var qrRSBlock = function(totalCount, dataCount) {
      var _this = {};
      _this.totalCount = totalCount;
      _this.dataCount = dataCount;
      return _this;
    };

    var _this = {};

    var getRsBlockTable = function(typeNumber, errorCorrectionLevel) {

      switch(errorCorrectionLevel) {
      case QRErrorCorrectionLevel.L :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
      case QRErrorCorrectionLevel.M :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
      case QRErrorCorrectionLevel.Q :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
      case QRErrorCorrectionLevel.H :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
      default :
        return undefined;
      }
    };

    _this.getRSBlocks = function(typeNumber, errorCorrectionLevel) {

      var rsBlock = getRsBlockTable(typeNumber, errorCorrectionLevel);

      if (typeof rsBlock == 'undefined') {
        throw 'bad rs block @ typeNumber:' + typeNumber +
            '/errorCorrectionLevel:' + errorCorrectionLevel;
      }

      var length = rsBlock.length / 3;

      var list = [];

      for (var i = 0; i < length; i += 1) {

        var count = rsBlock[i * 3 + 0];
        var totalCount = rsBlock[i * 3 + 1];
        var dataCount = rsBlock[i * 3 + 2];

        for (var j = 0; j < count; j += 1) {
          list.push(qrRSBlock(totalCount, dataCount) );
        }
      }

      return list;
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // qrBitBuffer
  //---------------------------------------------------------------------

  var qrBitBuffer = function() {

    var _buffer = [];
    var _length = 0;

    var _this = {};

    _this.getBuffer = function() {
      return _buffer;
    };

    _this.getAt = function(index) {
      var bufIndex = Math.floor(index / 8);
      return ( (_buffer[bufIndex] >>> (7 - index % 8) ) & 1) == 1;
    };

    _this.put = function(num, length) {
      for (var i = 0; i < length; i += 1) {
        _this.putBit( ( (num >>> (length - i - 1) ) & 1) == 1);
      }
    };

    _this.getLengthInBits = function() {
      return _length;
    };

    _this.putBit = function(bit) {

      var bufIndex = Math.floor(_length / 8);
      if (_buffer.length <= bufIndex) {
        _buffer.push(0);
      }

      if (bit) {
        _buffer[bufIndex] |= (0x80 >>> (_length % 8) );
      }

      _length += 1;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrNumber
  //---------------------------------------------------------------------

  var qrNumber = function(data) {

    var _mode = QRMode.MODE_NUMBER;
    var _data = data;

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _data.length;
    };

    _this.write = function(buffer) {

      var data = _data;

      var i = 0;

      while (i + 2 < data.length) {
        buffer.put(strToNum(data.substring(i, i + 3) ), 10);
        i += 3;
      }

      if (i < data.length) {
        if (data.length - i == 1) {
          buffer.put(strToNum(data.substring(i, i + 1) ), 4);
        } else if (data.length - i == 2) {
          buffer.put(strToNum(data.substring(i, i + 2) ), 7);
        }
      }
    };

    var strToNum = function(s) {
      var num = 0;
      for (var i = 0; i < s.length; i += 1) {
        num = num * 10 + chatToNum(s.charAt(i) );
      }
      return num;
    };

    var chatToNum = function(c) {
      if ('0' <= c && c <= '9') {
        return c.charCodeAt(0) - '0'.charCodeAt(0);
      }
      throw 'illegal char :' + c;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrAlphaNum
  //---------------------------------------------------------------------

  var qrAlphaNum = function(data) {

    var _mode = QRMode.MODE_ALPHA_NUM;
    var _data = data;

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _data.length;
    };

    _this.write = function(buffer) {

      var s = _data;

      var i = 0;

      while (i + 1 < s.length) {
        buffer.put(
          getCode(s.charAt(i) ) * 45 +
          getCode(s.charAt(i + 1) ), 11);
        i += 2;
      }

      if (i < s.length) {
        buffer.put(getCode(s.charAt(i) ), 6);
      }
    };

    var getCode = function(c) {

      if ('0' <= c && c <= '9') {
        return c.charCodeAt(0) - '0'.charCodeAt(0);
      } else if ('A' <= c && c <= 'Z') {
        return c.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
      } else {
        switch (c) {
        case ' ' : return 36;
        case '$' : return 37;
        case '%' : return 38;
        case '*' : return 39;
        case '+' : return 40;
        case '-' : return 41;
        case '.' : return 42;
        case '/' : return 43;
        case ':' : return 44;
        default :
          throw 'illegal char :' + c;
        }
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qr8BitByte
  //---------------------------------------------------------------------

  var qr8BitByte = function(data) {

    var _mode = QRMode.MODE_8BIT_BYTE;
    var _data = data;
    var _bytes = qrcode.stringToBytes(data);

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _bytes.length;
    };

    _this.write = function(buffer) {
      for (var i = 0; i < _bytes.length; i += 1) {
        buffer.put(_bytes[i], 8);
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrKanji
  //---------------------------------------------------------------------

  var qrKanji = function(data) {

    var _mode = QRMode.MODE_KANJI;
    var _data = data;

    var stringToBytes = qrcode.stringToBytesFuncs['SJIS'];
    if (!stringToBytes) {
      throw 'sjis not supported.';
    }
    !function(c, code) {
      // self test for sjis support.
      var test = stringToBytes(c);
      if (test.length != 2 || ( (test[0] << 8) | test[1]) != code) {
        throw 'sjis not supported.';
      }
    }('\u53cb', 0x9746);

    var _bytes = stringToBytes(data);

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return ~~(_bytes.length / 2);
    };

    _this.write = function(buffer) {

      var data = _bytes;

      var i = 0;

      while (i + 1 < data.length) {

        var c = ( (0xff & data[i]) << 8) | (0xff & data[i + 1]);

        if (0x8140 <= c && c <= 0x9FFC) {
          c -= 0x8140;
        } else if (0xE040 <= c && c <= 0xEBBF) {
          c -= 0xC140;
        } else {
          throw 'illegal char at ' + (i + 1) + '/' + c;
        }

        c = ( (c >>> 8) & 0xff) * 0xC0 + (c & 0xff);

        buffer.put(c, 13);

        i += 2;
      }

      if (i < data.length) {
        throw 'illegal char at ' + (i + 1);
      }
    };

    return _this;
  };

  //=====================================================================
  // GIF Support etc.
  //

  //---------------------------------------------------------------------
  // byteArrayOutputStream
  //---------------------------------------------------------------------

  var byteArrayOutputStream = function() {

    var _bytes = [];

    var _this = {};

    _this.writeByte = function(b) {
      _bytes.push(b & 0xff);
    };

    _this.writeShort = function(i) {
      _this.writeByte(i);
      _this.writeByte(i >>> 8);
    };

    _this.writeBytes = function(b, off, len) {
      off = off || 0;
      len = len || b.length;
      for (var i = 0; i < len; i += 1) {
        _this.writeByte(b[i + off]);
      }
    };

    _this.writeString = function(s) {
      for (var i = 0; i < s.length; i += 1) {
        _this.writeByte(s.charCodeAt(i) );
      }
    };

    _this.toByteArray = function() {
      return _bytes;
    };

    _this.toString = function() {
      var s = '';
      s += '[';
      for (var i = 0; i < _bytes.length; i += 1) {
        if (i > 0) {
          s += ',';
        }
        s += _bytes[i];
      }
      s += ']';
      return s;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // base64EncodeOutputStream
  //---------------------------------------------------------------------

  var base64EncodeOutputStream = function() {

    var _buffer = 0;
    var _buflen = 0;
    var _length = 0;
    var _base64 = '';

    var _this = {};

    var writeEncoded = function(b) {
      _base64 += String.fromCharCode(encode(b & 0x3f) );
    };

    var encode = function(n) {
      if (n < 0) {
        // error.
      } else if (n < 26) {
        return 0x41 + n;
      } else if (n < 52) {
        return 0x61 + (n - 26);
      } else if (n < 62) {
        return 0x30 + (n - 52);
      } else if (n == 62) {
        return 0x2b;
      } else if (n == 63) {
        return 0x2f;
      }
      throw 'n:' + n;
    };

    _this.writeByte = function(n) {

      _buffer = (_buffer << 8) | (n & 0xff);
      _buflen += 8;
      _length += 1;

      while (_buflen >= 6) {
        writeEncoded(_buffer >>> (_buflen - 6) );
        _buflen -= 6;
      }
    };

    _this.flush = function() {

      if (_buflen > 0) {
        writeEncoded(_buffer << (6 - _buflen) );
        _buffer = 0;
        _buflen = 0;
      }

      if (_length % 3 != 0) {
        // padding
        var padlen = 3 - _length % 3;
        for (var i = 0; i < padlen; i += 1) {
          _base64 += '=';
        }
      }
    };

    _this.toString = function() {
      return _base64;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // base64DecodeInputStream
  //---------------------------------------------------------------------

  var base64DecodeInputStream = function(str) {

    var _str = str;
    var _pos = 0;
    var _buffer = 0;
    var _buflen = 0;

    var _this = {};

    _this.read = function() {

      while (_buflen < 8) {

        if (_pos >= _str.length) {
          if (_buflen == 0) {
            return -1;
          }
          throw 'unexpected end of file./' + _buflen;
        }

        var c = _str.charAt(_pos);
        _pos += 1;

        if (c == '=') {
          _buflen = 0;
          return -1;
        } else if (c.match(/^\s$/) ) {
          // ignore if whitespace.
          continue;
        }

        _buffer = (_buffer << 6) | decode(c.charCodeAt(0) );
        _buflen += 6;
      }

      var n = (_buffer >>> (_buflen - 8) ) & 0xff;
      _buflen -= 8;
      return n;
    };

    var decode = function(c) {
      if (0x41 <= c && c <= 0x5a) {
        return c - 0x41;
      } else if (0x61 <= c && c <= 0x7a) {
        return c - 0x61 + 26;
      } else if (0x30 <= c && c <= 0x39) {
        return c - 0x30 + 52;
      } else if (c == 0x2b) {
        return 62;
      } else if (c == 0x2f) {
        return 63;
      } else {
        throw 'c:' + c;
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // gifImage (B/W)
  //---------------------------------------------------------------------

  var gifImage = function(width, height) {

    var _width = width;
    var _height = height;
    var _data = new Array(width * height);

    var _this = {};

    _this.setPixel = function(x, y, pixel) {
      _data[y * _width + x] = pixel;
    };

    _this.write = function(out) {

      //---------------------------------
      // GIF Signature

      out.writeString('GIF87a');

      //---------------------------------
      // Screen Descriptor

      out.writeShort(_width);
      out.writeShort(_height);

      out.writeByte(0x80); // 2bit
      out.writeByte(0);
      out.writeByte(0);

      //---------------------------------
      // Global Color Map

      // black
      out.writeByte(0x00);
      out.writeByte(0x00);
      out.writeByte(0x00);

      // white
      out.writeByte(0xff);
      out.writeByte(0xff);
      out.writeByte(0xff);

      //---------------------------------
      // Image Descriptor

      out.writeString(',');
      out.writeShort(0);
      out.writeShort(0);
      out.writeShort(_width);
      out.writeShort(_height);
      out.writeByte(0);

      //---------------------------------
      // Local Color Map

      //---------------------------------
      // Raster Data

      var lzwMinCodeSize = 2;
      var raster = getLZWRaster(lzwMinCodeSize);

      out.writeByte(lzwMinCodeSize);

      var offset = 0;

      while (raster.length - offset > 255) {
        out.writeByte(255);
        out.writeBytes(raster, offset, 255);
        offset += 255;
      }

      out.writeByte(raster.length - offset);
      out.writeBytes(raster, offset, raster.length - offset);
      out.writeByte(0x00);

      //---------------------------------
      // GIF Terminator
      out.writeString(';');
    };

    var bitOutputStream = function(out) {

      var _out = out;
      var _bitLength = 0;
      var _bitBuffer = 0;

      var _this = {};

      _this.write = function(data, length) {

        if ( (data >>> length) != 0) {
          throw 'length over';
        }

        while (_bitLength + length >= 8) {
          _out.writeByte(0xff & ( (data << _bitLength) | _bitBuffer) );
          length -= (8 - _bitLength);
          data >>>= (8 - _bitLength);
          _bitBuffer = 0;
          _bitLength = 0;
        }

        _bitBuffer = (data << _bitLength) | _bitBuffer;
        _bitLength = _bitLength + length;
      };

      _this.flush = function() {
        if (_bitLength > 0) {
          _out.writeByte(_bitBuffer);
        }
      };

      return _this;
    };

    var getLZWRaster = function(lzwMinCodeSize) {

      var clearCode = 1 << lzwMinCodeSize;
      var endCode = (1 << lzwMinCodeSize) + 1;
      var bitLength = lzwMinCodeSize + 1;

      // Setup LZWTable
      var table = lzwTable();

      for (var i = 0; i < clearCode; i += 1) {
        table.add(String.fromCharCode(i) );
      }
      table.add(String.fromCharCode(clearCode) );
      table.add(String.fromCharCode(endCode) );

      var byteOut = byteArrayOutputStream();
      var bitOut = bitOutputStream(byteOut);

      // clear code
      bitOut.write(clearCode, bitLength);

      var dataIndex = 0;

      var s = String.fromCharCode(_data[dataIndex]);
      dataIndex += 1;

      while (dataIndex < _data.length) {

        var c = String.fromCharCode(_data[dataIndex]);
        dataIndex += 1;

        if (table.contains(s + c) ) {

          s = s + c;

        } else {

          bitOut.write(table.indexOf(s), bitLength);

          if (table.size() < 0xfff) {

            if (table.size() == (1 << bitLength) ) {
              bitLength += 1;
            }

            table.add(s + c);
          }

          s = c;
        }
      }

      bitOut.write(table.indexOf(s), bitLength);

      // end code
      bitOut.write(endCode, bitLength);

      bitOut.flush();

      return byteOut.toByteArray();
    };

    var lzwTable = function() {

      var _map = {};
      var _size = 0;

      var _this = {};

      _this.add = function(key) {
        if (_this.contains(key) ) {
          throw 'dup key:' + key;
        }
        _map[key] = _size;
        _size += 1;
      };

      _this.size = function() {
        return _size;
      };

      _this.indexOf = function(key) {
        return _map[key];
      };

      _this.contains = function(key) {
        return typeof _map[key] != 'undefined';
      };

      return _this;
    };

    return _this;
  };

  var createDataURL = function(width, height, getPixel) {
    var gif = gifImage(width, height);
    for (var y = 0; y < height; y += 1) {
      for (var x = 0; x < width; x += 1) {
        gif.setPixel(x, y, getPixel(x, y) );
      }
    }

    var b = byteArrayOutputStream();
    gif.write(b);

    var base64 = base64EncodeOutputStream();
    var bytes = b.toByteArray();
    for (var i = 0; i < bytes.length; i += 1) {
      base64.writeByte(bytes[i]);
    }
    base64.flush();

    return 'data:image/gif;base64,' + base64;
  };

  //---------------------------------------------------------------------
  // returns qrcode function.

  return qrcode;
}();

// multibyte support
!function() {

  qrcode.stringToBytesFuncs['UTF-8'] = function(s) {
    // http://stackoverflow.com/questions/18729405/how-to-convert-utf8-string-to-byte-array
    function toUTF8Array(str) {
      var utf8 = [];
      for (var i=0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
          utf8.push(0xc0 | (charcode >> 6),
              0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
          utf8.push(0xe0 | (charcode >> 12),
              0x80 | ((charcode>>6) & 0x3f),
              0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
          i++;
          // UTF-16 encodes 0x10000-0x10FFFF by
          // subtracting 0x10000 and splitting the
          // 20 bits of 0x0-0xFFFFF into two halves
          charcode = 0x10000 + (((charcode & 0x3ff)<<10)
            | (str.charCodeAt(i) & 0x3ff));
          utf8.push(0xf0 | (charcode >>18),
              0x80 | ((charcode>>12) & 0x3f),
              0x80 | ((charcode>>6) & 0x3f),
              0x80 | (charcode & 0x3f));
        }
      }
      return utf8;
    }
    return toUTF8Array(s);
  };

}();

(function (factory) {
  if (true) {
      !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else {}
}(function () {
    return qrcode;
}));


/***/ }),

/***/ "./src/constants/cornerDotTypes.ts":
/*!*****************************************!*\
  !*** ./src/constants/cornerDotTypes.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    dot: "dot",
    square: "square",
    heart: "heart",
    star: "star" // Add this line for the new type
});


/***/ }),

/***/ "./src/constants/cornerSquareTypes.ts":
/*!********************************************!*\
  !*** ./src/constants/cornerSquareTypes.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    dot: "dot",
    square: "square",
    extraRounded: "extra-rounded"
});


/***/ }),

/***/ "./src/constants/dotTypes.ts":
/*!***********************************!*\
  !*** ./src/constants/dotTypes.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    dots: "dots",
    randomDots: "random-dots",
    rounded: "rounded",
    verticalLines: "vertical-lines",
    horizontalLines: "horizontal-lines",
    classy: "classy",
    classyRounded: "classy-rounded",
    square: "square",
    extraRounded: "extra-rounded"
});


/***/ }),

/***/ "./src/constants/drawTypes.ts":
/*!************************************!*\
  !*** ./src/constants/drawTypes.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    canvas: "canvas",
    svg: "svg"
});


/***/ }),

/***/ "./src/constants/errorCorrectionLevels.ts":
/*!************************************************!*\
  !*** ./src/constants/errorCorrectionLevels.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    L: "L",
    M: "M",
    Q: "Q",
    H: "H"
});


/***/ }),

/***/ "./src/constants/errorCorrectionPercents.ts":
/*!**************************************************!*\
  !*** ./src/constants/errorCorrectionPercents.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    L: 0.07,
    M: 0.15,
    Q: 0.25,
    H: 0.3
});


/***/ }),

/***/ "./src/constants/gradientTypes.ts":
/*!****************************************!*\
  !*** ./src/constants/gradientTypes.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    radial: "radial",
    linear: "linear"
});


/***/ }),

/***/ "./src/constants/modes.ts":
/*!********************************!*\
  !*** ./src/constants/modes.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    numeric: "Numeric",
    alphanumeric: "Alphanumeric",
    byte: "Byte",
    kanji: "Kanji"
});


/***/ }),

/***/ "./src/constants/qrTypes.ts":
/*!**********************************!*\
  !*** ./src/constants/qrTypes.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
var qrTypes = {};
for (var type = 0; type <= 40; type++) {
    qrTypes[type] = type;
}
// 0 types is autodetect
// types = {
//     0: 0,
//     1: 1,
//     ...
//     40: 40
// }
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (qrTypes);


/***/ }),

/***/ "./src/constants/shapeTypes.ts":
/*!*************************************!*\
  !*** ./src/constants/shapeTypes.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    square: "square",
    circle: "circle"
});


/***/ }),

/***/ "./src/core/QRCodeStyling.ts":
/*!***********************************!*\
  !*** ./src/core/QRCodeStyling.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _tools_getMode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../tools/getMode */ "./src/tools/getMode.ts");
/* harmony import */ var _tools_merge__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../tools/merge */ "./src/tools/merge.ts");
/* harmony import */ var _tools_downloadURI__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../tools/downloadURI */ "./src/tools/downloadURI.ts");
/* harmony import */ var _QRSVG__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./QRSVG */ "./src/core/QRSVG.ts");
/* harmony import */ var _constants_drawTypes__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../constants/drawTypes */ "./src/constants/drawTypes.ts");
/* harmony import */ var _QROptions__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./QROptions */ "./src/core/QROptions.ts");
/* harmony import */ var _tools_sanitizeOptions__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../tools/sanitizeOptions */ "./src/tools/sanitizeOptions.ts");
/* harmony import */ var qrcode_generator__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! qrcode-generator */ "./node_modules/qrcode-generator/qrcode.js");
/* harmony import */ var qrcode_generator__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(qrcode_generator__WEBPACK_IMPORTED_MODULE_7__);
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};








var QRCodeStyling = /** @class */ (function () {
    function QRCodeStyling(options) {
        this._options = options ? (0,_tools_sanitizeOptions__WEBPACK_IMPORTED_MODULE_6__["default"])((0,_tools_merge__WEBPACK_IMPORTED_MODULE_1__["default"])(_QROptions__WEBPACK_IMPORTED_MODULE_5__["default"], options)) : _QROptions__WEBPACK_IMPORTED_MODULE_5__["default"];
        this.update();
    }
    QRCodeStyling._clearContainer = function (container) {
        if (container) {
            container.innerHTML = "";
        }
    };
    QRCodeStyling.prototype._setupSvg = function () {
        var _this = this;
        if (!this._qr) {
            return;
        }
        var qrSVG = new _QRSVG__WEBPACK_IMPORTED_MODULE_3__["default"](this._options);
        this._svg = qrSVG.getElement();
        this._svgDrawingPromise = qrSVG.drawQR(this._qr).then(function () {
            var _a;
            if (!_this._svg)
                return;
            (_a = _this._extension) === null || _a === void 0 ? void 0 : _a.call(_this, qrSVG.getElement(), _this._options);
        });
    };
    QRCodeStyling.prototype._setupCanvas = function () {
        var _this = this;
        var _a;
        if (!this._qr) {
            return;
        }
        this._canvas = document.createElement("canvas");
        this._canvas.width = this._options.width;
        this._canvas.height = this._options.height;
        this._setupSvg();
        this._canvasDrawingPromise = (_a = this._svgDrawingPromise) === null || _a === void 0 ? void 0 : _a.then(function () {
            if (!_this._svg)
                return;
            var svg = _this._svg;
            var xml = new XMLSerializer().serializeToString(svg);
            var svg64 = btoa(xml);
            var image64 = "data:image/svg+xml;base64," + svg64;
            var image = new Image();
            return new Promise(function (resolve) {
                image.onload = function () {
                    var _a, _b;
                    (_b = (_a = _this._canvas) === null || _a === void 0 ? void 0 : _a.getContext("2d")) === null || _b === void 0 ? void 0 : _b.drawImage(image, 0, 0);
                    resolve();
                };
                image.src = image64;
            });
        });
    };
    QRCodeStyling.prototype._getElement = function (extension) {
        if (extension === void 0) { extension = "png"; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._qr)
                            throw "QR code is empty";
                        if (!(extension.toLowerCase() === "svg")) return [3 /*break*/, 2];
                        if (!this._svg || !this._svgDrawingPromise) {
                            this._setupSvg();
                        }
                        return [4 /*yield*/, this._svgDrawingPromise];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this._svg];
                    case 2:
                        if (!this._canvas || !this._canvasDrawingPromise) {
                            this._setupCanvas();
                        }
                        return [4 /*yield*/, this._canvasDrawingPromise];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, this._canvas];
                }
            });
        });
    };
    QRCodeStyling.prototype.update = function (options) {
        QRCodeStyling._clearContainer(this._container);
        this._options = options ? (0,_tools_sanitizeOptions__WEBPACK_IMPORTED_MODULE_6__["default"])((0,_tools_merge__WEBPACK_IMPORTED_MODULE_1__["default"])(this._options, options)) : this._options;
        if (!this._options.data) {
            return;
        }
        this._qr = qrcode_generator__WEBPACK_IMPORTED_MODULE_7___default()(this._options.qrOptions.typeNumber, this._options.qrOptions.errorCorrectionLevel);
        this._qr.addData(this._options.data, this._options.qrOptions.mode || (0,_tools_getMode__WEBPACK_IMPORTED_MODULE_0__["default"])(this._options.data));
        this._qr.make();
        if (this._options.type === _constants_drawTypes__WEBPACK_IMPORTED_MODULE_4__["default"].canvas) {
            this._setupCanvas();
        }
        else {
            this._setupSvg();
        }
        this.append(this._container);
    };
    QRCodeStyling.prototype.append = function (container) {
        if (!container) {
            return;
        }
        if (typeof container.appendChild !== "function") {
            throw "Container should be a single DOM node";
        }
        if (this._options.type === _constants_drawTypes__WEBPACK_IMPORTED_MODULE_4__["default"].canvas) {
            if (this._canvas) {
                container.appendChild(this._canvas);
            }
        }
        else {
            if (this._svg) {
                container.appendChild(this._svg);
            }
        }
        this._container = container;
    };
    QRCodeStyling.prototype.applyExtension = function (extension) {
        if (!extension) {
            throw "Extension function should be defined.";
        }
        this._extension = extension;
        this.update();
    };
    QRCodeStyling.prototype.deleteExtension = function () {
        this._extension = undefined;
        this.update();
    };
    QRCodeStyling.prototype.getRawData = function (extension) {
        if (extension === void 0) { extension = "png"; }
        return __awaiter(this, void 0, void 0, function () {
            var element, serializer, source;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._qr)
                            throw "QR code is empty";
                        return [4 /*yield*/, this._getElement(extension)];
                    case 1:
                        element = _a.sent();
                        if (!element) {
                            return [2 /*return*/, null];
                        }
                        if (extension.toLowerCase() === "svg") {
                            serializer = new XMLSerializer();
                            source = serializer.serializeToString(element);
                            return [2 /*return*/, new Blob(['<?xml version="1.0" standalone="no"?>\r\n' + source], { type: "image/svg+xml" })];
                        }
                        else {
                            return [2 /*return*/, new Promise(function (resolve) { return element.toBlob(resolve, "image/".concat(extension), 1); })];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    QRCodeStyling.prototype.download = function (downloadOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var extension, name, element, serializer, source, url, url;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._qr)
                            throw "QR code is empty";
                        extension = "png";
                        name = "qr";
                        //TODO remove deprecated code in the v2
                        if (typeof downloadOptions === "string") {
                            extension = downloadOptions;
                            console.warn("Extension is deprecated as argument for 'download' method, please pass object { name: '...', extension: '...' } as argument");
                        }
                        else if (typeof downloadOptions === "object" && downloadOptions !== null) {
                            if (downloadOptions.name) {
                                name = downloadOptions.name;
                            }
                            if (downloadOptions.extension) {
                                extension = downloadOptions.extension;
                            }
                        }
                        return [4 /*yield*/, this._getElement(extension)];
                    case 1:
                        element = _a.sent();
                        if (!element) {
                            return [2 /*return*/];
                        }
                        if (extension.toLowerCase() === "svg") {
                            serializer = new XMLSerializer();
                            source = serializer.serializeToString(element);
                            source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
                            url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
                            (0,_tools_downloadURI__WEBPACK_IMPORTED_MODULE_2__["default"])(url, "".concat(name, ".svg"));
                        }
                        else {
                            url = element.toDataURL("image/".concat(extension));
                            (0,_tools_downloadURI__WEBPACK_IMPORTED_MODULE_2__["default"])(url, "".concat(name, ".").concat(extension));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return QRCodeStyling;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (QRCodeStyling);


/***/ }),

/***/ "./src/core/QROptions.ts":
/*!*******************************!*\
  !*** ./src/core/QROptions.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _constants_qrTypes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/qrTypes */ "./src/constants/qrTypes.ts");
/* harmony import */ var _constants_drawTypes__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants/drawTypes */ "./src/constants/drawTypes.ts");
/* harmony import */ var _constants_shapeTypes__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../constants/shapeTypes */ "./src/constants/shapeTypes.ts");
/* harmony import */ var _constants_errorCorrectionLevels__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../constants/errorCorrectionLevels */ "./src/constants/errorCorrectionLevels.ts");




var defaultOptions = {
    type: _constants_drawTypes__WEBPACK_IMPORTED_MODULE_1__["default"].canvas,
    shape: _constants_shapeTypes__WEBPACK_IMPORTED_MODULE_2__["default"].square,
    width: 300,
    height: 300,
    data: "",
    margin: 0,
    qrOptions: {
        typeNumber: _constants_qrTypes__WEBPACK_IMPORTED_MODULE_0__["default"][0],
        mode: undefined,
        errorCorrectionLevel: _constants_errorCorrectionLevels__WEBPACK_IMPORTED_MODULE_3__["default"].Q
    },
    imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.4,
        crossOrigin: undefined,
        margin: 0
    },
    dotsOptions: {
        type: "square",
        color: "#000"
    },
    backgroundOptions: {
        round: 0,
        color: "#fff"
    }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (defaultOptions);


/***/ }),

/***/ "./src/core/QRSVG.ts":
/*!***************************!*\
  !*** ./src/core/QRSVG.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _tools_calculateImageSize__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../tools/calculateImageSize */ "./src/tools/calculateImageSize.ts");
/* harmony import */ var _tools_toDataUrl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../tools/toDataUrl */ "./src/tools/toDataUrl.ts");
/* harmony import */ var _constants_errorCorrectionPercents__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../constants/errorCorrectionPercents */ "./src/constants/errorCorrectionPercents.ts");
/* harmony import */ var _figures_dot_QRDot__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../figures/dot/QRDot */ "./src/figures/dot/QRDot.ts");
/* harmony import */ var _figures_cornerSquare_QRCornerSquare__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../figures/cornerSquare/QRCornerSquare */ "./src/figures/cornerSquare/QRCornerSquare.ts");
/* harmony import */ var _figures_cornerDot_QRCornerDot__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../figures/cornerDot/QRCornerDot */ "./src/figures/cornerDot/QRCornerDot.ts");
/* harmony import */ var _constants_gradientTypes__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../constants/gradientTypes */ "./src/constants/gradientTypes.ts");
/* harmony import */ var _constants_shapeTypes__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../constants/shapeTypes */ "./src/constants/shapeTypes.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};








var squareMask = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1]
];
var dotMask = [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0]
];
var QRSVG = /** @class */ (function () {
    //TODO don't pass all options to this class
    function QRSVG(options) {
        this._element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this._element.setAttribute("width", String(options.width));
        this._element.setAttribute("height", String(options.height));
        this._defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        this._element.appendChild(this._defs);
        this._options = options;
    }
    Object.defineProperty(QRSVG.prototype, "width", {
        get: function () {
            return this._options.width;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(QRSVG.prototype, "height", {
        get: function () {
            return this._options.height;
        },
        enumerable: false,
        configurable: true
    });
    QRSVG.prototype.getElement = function () {
        return this._element;
    };
    QRSVG.prototype.drawQR = function (qr) {
        return __awaiter(this, void 0, void 0, function () {
            var count, minSize, realQRSize, dotSize, drawImageSize, _a, imageOptions, qrOptions, coverLevel, maxHiddenDots;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        count = qr.getModuleCount();
                        minSize = Math.min(this._options.width, this._options.height) - this._options.margin * 2;
                        realQRSize = this._options.shape === _constants_shapeTypes__WEBPACK_IMPORTED_MODULE_7__["default"].circle ? minSize / Math.sqrt(2) : minSize;
                        dotSize = Math.floor(realQRSize / count);
                        drawImageSize = {
                            hideXDots: 0,
                            hideYDots: 0,
                            width: 0,
                            height: 0
                        };
                        this._qr = qr;
                        if (!this._options.image) return [3 /*break*/, 2];
                        //We need it to get image size
                        return [4 /*yield*/, this.loadImage()];
                    case 1:
                        //We need it to get image size
                        _b.sent();
                        if (!this._image)
                            return [2 /*return*/];
                        _a = this._options, imageOptions = _a.imageOptions, qrOptions = _a.qrOptions;
                        coverLevel = imageOptions.imageSize * _constants_errorCorrectionPercents__WEBPACK_IMPORTED_MODULE_2__["default"][qrOptions.errorCorrectionLevel];
                        maxHiddenDots = Math.floor(coverLevel * count * count);
                        drawImageSize = (0,_tools_calculateImageSize__WEBPACK_IMPORTED_MODULE_0__["default"])({
                            originalWidth: this._image.width,
                            originalHeight: this._image.height,
                            maxHiddenDots: maxHiddenDots,
                            maxHiddenAxisDots: count - 14,
                            dotSize: dotSize
                        });
                        _b.label = 2;
                    case 2:
                        this.drawBackground();
                        this.drawDots(function (i, j) {
                            var _a, _b, _c, _d, _e, _f;
                            if (_this._options.imageOptions.hideBackgroundDots) {
                                if (i >= (count - drawImageSize.hideXDots) / 2 &&
                                    i < (count + drawImageSize.hideXDots) / 2 &&
                                    j >= (count - drawImageSize.hideYDots) / 2 &&
                                    j < (count + drawImageSize.hideYDots) / 2) {
                                    return false;
                                }
                            }
                            if (((_a = squareMask[i]) === null || _a === void 0 ? void 0 : _a[j]) || ((_b = squareMask[i - count + 7]) === null || _b === void 0 ? void 0 : _b[j]) || ((_c = squareMask[i]) === null || _c === void 0 ? void 0 : _c[j - count + 7])) {
                                return false;
                            }
                            if (((_d = dotMask[i]) === null || _d === void 0 ? void 0 : _d[j]) || ((_e = dotMask[i - count + 7]) === null || _e === void 0 ? void 0 : _e[j]) || ((_f = dotMask[i]) === null || _f === void 0 ? void 0 : _f[j - count + 7])) {
                                return false;
                            }
                            return true;
                        });
                        this.drawCorners();
                        if (!this._options.image) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.drawImage({ width: drawImageSize.width, height: drawImageSize.height, count: count, dotSize: dotSize })];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    QRSVG.prototype.drawBackground = function () {
        var _a, _b, _c;
        var element = this._element;
        var options = this._options;
        if (element) {
            var gradientOptions = (_a = options.backgroundOptions) === null || _a === void 0 ? void 0 : _a.gradient;
            var color = (_b = options.backgroundOptions) === null || _b === void 0 ? void 0 : _b.color;
            if (gradientOptions || color) {
                this._createColor({
                    options: gradientOptions,
                    color: color,
                    additionalRotation: 0,
                    x: 0,
                    y: 0,
                    height: options.height,
                    width: options.width,
                    name: "background-color"
                });
            }
            if ((_c = options.backgroundOptions) === null || _c === void 0 ? void 0 : _c.round) {
                var size = Math.min(options.width, options.height);
                var element_1 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                this._backgroundClipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
                this._backgroundClipPath.setAttribute("id", "clip-path-background-color");
                this._defs.appendChild(this._backgroundClipPath);
                element_1.setAttribute("x", String((options.width - size) / 2));
                element_1.setAttribute("y", String((options.height - size) / 2));
                element_1.setAttribute("width", String(size));
                element_1.setAttribute("height", String(size));
                element_1.setAttribute("rx", String((size / 2) * options.backgroundOptions.round));
                this._backgroundClipPath.appendChild(element_1);
            }
        }
    };
    QRSVG.prototype.drawDots = function (filter) {
        var _this = this;
        var _a, _b;
        if (!this._qr) {
            throw "QR code is not defined";
        }
        var options = this._options;
        var count = this._qr.getModuleCount();
        if (count > options.width || count > options.height) {
            throw "The canvas is too small.";
        }
        var minSize = Math.min(options.width, options.height) - options.margin * 2;
        var realQRSize = options.shape === _constants_shapeTypes__WEBPACK_IMPORTED_MODULE_7__["default"].circle ? minSize / Math.sqrt(2) : minSize;
        var dotSize = Math.floor(realQRSize / count);
        var xBeginning = Math.floor((options.width - count * dotSize) / 2);
        var yBeginning = Math.floor((options.height - count * dotSize) / 2);
        var dot = new _figures_dot_QRDot__WEBPACK_IMPORTED_MODULE_3__["default"]({ svg: this._element, type: options.dotsOptions.type });
        this._dotsClipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
        this._dotsClipPath.setAttribute("id", "clip-path-dot-color");
        this._defs.appendChild(this._dotsClipPath);
        this._createColor({
            options: (_a = options.dotsOptions) === null || _a === void 0 ? void 0 : _a.gradient,
            color: options.dotsOptions.color,
            additionalRotation: 0,
            x: 0,
            y: 0,
            height: options.height,
            width: options.width,
            name: "dot-color"
        });
        var _loop_1 = function (i) {
            var _loop_3 = function (j) {
                if (filter && !filter(i, j)) {
                    return "continue";
                }
                if (!((_b = this_1._qr) === null || _b === void 0 ? void 0 : _b.isDark(i, j))) {
                    return "continue";
                }
                dot.draw(xBeginning + i * dotSize, yBeginning + j * dotSize, dotSize, function (xOffset, yOffset) {
                    if (i + xOffset < 0 || j + yOffset < 0 || i + xOffset >= count || j + yOffset >= count)
                        return false;
                    if (filter && !filter(i + xOffset, j + yOffset))
                        return false;
                    return !!_this._qr && _this._qr.isDark(i + xOffset, j + yOffset);
                });
                if (dot._element && this_1._dotsClipPath) {
                    this_1._dotsClipPath.appendChild(dot._element);
                }
            };
            for (var j = 0; j < count; j++) {
                _loop_3(j);
            }
        };
        var this_1 = this;
        for (var i = 0; i < count; i++) {
            _loop_1(i);
        }
        if (options.shape === _constants_shapeTypes__WEBPACK_IMPORTED_MODULE_7__["default"].circle) {
            var additionalDots = Math.floor((minSize / dotSize - count) / 2);
            var fakeCount = count + additionalDots * 2;
            var xFakeBeginning = xBeginning - additionalDots * dotSize;
            var yFakeBeginning = yBeginning - additionalDots * dotSize;
            var fakeMatrix_1 = [];
            var center = Math.floor(fakeCount / 2);
            for (var i = 0; i < fakeCount; i++) {
                fakeMatrix_1[i] = [];
                for (var j = 0; j < fakeCount; j++) {
                    if (i >= additionalDots - 1 &&
                        i <= fakeCount - additionalDots &&
                        j >= additionalDots - 1 &&
                        j <= fakeCount - additionalDots) {
                        fakeMatrix_1[i][j] = 0;
                        continue;
                    }
                    if (Math.sqrt((i - center) * (i - center) + (j - center) * (j - center)) > center) {
                        fakeMatrix_1[i][j] = 0;
                        continue;
                    }
                    //Get random dots from QR code to show it outside of QR code
                    fakeMatrix_1[i][j] = this._qr.isDark(j - 2 * additionalDots < 0 ? j : j >= count ? j - 2 * additionalDots : j - additionalDots, i - 2 * additionalDots < 0 ? i : i >= count ? i - 2 * additionalDots : i - additionalDots)
                        ? 1
                        : 0;
                }
            }
            var _loop_2 = function (i) {
                var _loop_4 = function (j) {
                    if (!fakeMatrix_1[i][j])
                        return "continue";
                    dot.draw(xFakeBeginning + i * dotSize, yFakeBeginning + j * dotSize, dotSize, function (xOffset, yOffset) {
                        var _a;
                        return !!((_a = fakeMatrix_1[i + xOffset]) === null || _a === void 0 ? void 0 : _a[j + yOffset]);
                    });
                    if (dot._element && this_2._dotsClipPath) {
                        this_2._dotsClipPath.appendChild(dot._element);
                    }
                };
                for (var j = 0; j < fakeCount; j++) {
                    _loop_4(j);
                }
            };
            var this_2 = this;
            for (var i = 0; i < fakeCount; i++) {
                _loop_2(i);
            }
        }
    };
    QRSVG.prototype.drawCorners = function () {
        var _this = this;
        if (!this._qr) {
            throw "QR code is not defined";
        }
        var element = this._element;
        var options = this._options;
        if (!element) {
            throw "Element code is not defined";
        }
        var count = this._qr.getModuleCount();
        var minSize = Math.min(options.width, options.height) - options.margin * 2;
        var realQRSize = options.shape === _constants_shapeTypes__WEBPACK_IMPORTED_MODULE_7__["default"].circle ? minSize / Math.sqrt(2) : minSize;
        var dotSize = Math.floor(realQRSize / count);
        var cornersSquareSize = dotSize * 7;
        var cornersDotSize = dotSize * 3;
        var xBeginning = Math.floor((options.width - count * dotSize) / 2);
        var yBeginning = Math.floor((options.height - count * dotSize) / 2);
        [
            [0, 0, 0],
            [1, 0, Math.PI / 2],
            [0, 1, -Math.PI / 2]
        ].forEach(function (_a) {
            var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
            var column = _a[0], row = _a[1], rotation = _a[2];
            var x = xBeginning + column * dotSize * (count - 7);
            var y = yBeginning + row * dotSize * (count - 7);
            var cornersSquareClipPath = _this._dotsClipPath;
            var cornersDotClipPath = _this._dotsClipPath;
            if (((_b = options.cornersSquareOptions) === null || _b === void 0 ? void 0 : _b.gradient) || ((_c = options.cornersSquareOptions) === null || _c === void 0 ? void 0 : _c.color)) {
                cornersSquareClipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
                cornersSquareClipPath.setAttribute("id", "clip-path-corners-square-color-".concat(column, "-").concat(row));
                _this._defs.appendChild(cornersSquareClipPath);
                _this._cornersSquareClipPath = _this._cornersDotClipPath = cornersDotClipPath = cornersSquareClipPath;
                _this._createColor({
                    options: (_d = options.cornersSquareOptions) === null || _d === void 0 ? void 0 : _d.gradient,
                    color: (_e = options.cornersSquareOptions) === null || _e === void 0 ? void 0 : _e.color,
                    additionalRotation: rotation,
                    x: x,
                    y: y,
                    height: cornersSquareSize,
                    width: cornersSquareSize,
                    name: "corners-square-color-".concat(column, "-").concat(row)
                });
            }
            if ((_f = options.cornersSquareOptions) === null || _f === void 0 ? void 0 : _f.type) {
                var cornersSquare = new _figures_cornerSquare_QRCornerSquare__WEBPACK_IMPORTED_MODULE_4__["default"]({ svg: _this._element, type: options.cornersSquareOptions.type });
                cornersSquare.draw(x, y, cornersSquareSize, rotation);
                if (cornersSquare._element && cornersSquareClipPath) {
                    cornersSquareClipPath.appendChild(cornersSquare._element);
                }
            }
            else {
                var dot = new _figures_dot_QRDot__WEBPACK_IMPORTED_MODULE_3__["default"]({ svg: _this._element, type: options.dotsOptions.type });
                var _loop_5 = function (i) {
                    var _loop_7 = function (j) {
                        if (!((_g = squareMask[i]) === null || _g === void 0 ? void 0 : _g[j])) {
                            return "continue";
                        }
                        dot.draw(x + i * dotSize, y + j * dotSize, dotSize, function (xOffset, yOffset) { var _a; return !!((_a = squareMask[i + xOffset]) === null || _a === void 0 ? void 0 : _a[j + yOffset]); });
                        if (dot._element && cornersSquareClipPath) {
                            cornersSquareClipPath.appendChild(dot._element);
                        }
                    };
                    for (var j = 0; j < squareMask[i].length; j++) {
                        _loop_7(j);
                    }
                };
                for (var i = 0; i < squareMask.length; i++) {
                    _loop_5(i);
                }
            }
            if (((_h = options.cornersDotOptions) === null || _h === void 0 ? void 0 : _h.gradient) || ((_j = options.cornersDotOptions) === null || _j === void 0 ? void 0 : _j.color)) {
                cornersDotClipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
                cornersDotClipPath.setAttribute("id", "clip-path-corners-dot-color-".concat(column, "-").concat(row));
                _this._defs.appendChild(cornersDotClipPath);
                _this._cornersDotClipPath = cornersDotClipPath;
                _this._createColor({
                    options: (_k = options.cornersDotOptions) === null || _k === void 0 ? void 0 : _k.gradient,
                    color: (_l = options.cornersDotOptions) === null || _l === void 0 ? void 0 : _l.color,
                    additionalRotation: rotation,
                    x: x + dotSize * 2,
                    y: y + dotSize * 2,
                    height: cornersDotSize,
                    width: cornersDotSize,
                    name: "corners-dot-color-".concat(column, "-").concat(row)
                });
            }
            if ((_m = options.cornersDotOptions) === null || _m === void 0 ? void 0 : _m.type) {
                var cornersDot = new _figures_cornerDot_QRCornerDot__WEBPACK_IMPORTED_MODULE_5__["default"]({
                    svg: _this._element,
                    type: options.cornersDotOptions.type,
                    color: (_o = options.cornersDotOptions.color) !== null && _o !== void 0 ? _o : options.dotsOptions.color
                });
                cornersDot.draw(x + dotSize * 2, y + dotSize * 2, cornersDotSize, rotation);
                if (cornersDot._element && cornersDotClipPath) {
                    cornersDotClipPath.appendChild(cornersDot._element);
                }
            }
            else {
                var dot = new _figures_dot_QRDot__WEBPACK_IMPORTED_MODULE_3__["default"]({ svg: _this._element, type: options.dotsOptions.type });
                var _loop_6 = function (i) {
                    var _loop_8 = function (j) {
                        if (!((_p = dotMask[i]) === null || _p === void 0 ? void 0 : _p[j])) {
                            return "continue";
                        }
                        dot.draw(x + i * dotSize, y + j * dotSize, dotSize, function (xOffset, yOffset) { var _a; return !!((_a = dotMask[i + xOffset]) === null || _a === void 0 ? void 0 : _a[j + yOffset]); });
                        if (dot._element && cornersDotClipPath) {
                            cornersDotClipPath.appendChild(dot._element);
                        }
                    };
                    for (var j = 0; j < dotMask[i].length; j++) {
                        _loop_8(j);
                    }
                };
                for (var i = 0; i < dotMask.length; i++) {
                    _loop_6(i);
                }
            }
        });
    };
    QRSVG.prototype.loadImage = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var options = _this._options;
            var image = new Image();
            if (!options.image) {
                return reject("Image is not defined");
            }
            if (typeof options.imageOptions.crossOrigin === "string") {
                image.crossOrigin = options.imageOptions.crossOrigin;
            }
            _this._image = image;
            image.onload = function () {
                resolve();
            };
            image.src = options.image;
        });
    };
    QRSVG.prototype.drawImage = function (_a) {
        var width = _a.width, height = _a.height, count = _a.count, dotSize = _a.dotSize;
        return __awaiter(this, void 0, void 0, function () {
            var options, xBeginning, yBeginning, dx, dy, dw, dh, image, imageUrl;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        options = this._options;
                        xBeginning = Math.floor((options.width - count * dotSize) / 2);
                        yBeginning = Math.floor((options.height - count * dotSize) / 2);
                        dx = xBeginning + options.imageOptions.margin + (count * dotSize - width) / 2;
                        dy = yBeginning + options.imageOptions.margin + (count * dotSize - height) / 2;
                        dw = width - options.imageOptions.margin * 2;
                        dh = height - options.imageOptions.margin * 2;
                        image = document.createElementNS("http://www.w3.org/2000/svg", "image");
                        image.setAttribute("x", String(dx));
                        image.setAttribute("y", String(dy));
                        image.setAttribute("width", "".concat(dw, "px"));
                        image.setAttribute("height", "".concat(dh, "px"));
                        return [4 /*yield*/, (0,_tools_toDataUrl__WEBPACK_IMPORTED_MODULE_1__["default"])(options.image || "")];
                    case 1:
                        imageUrl = _b.sent();
                        image.setAttribute("href", imageUrl || "");
                        this._element.appendChild(image);
                        return [2 /*return*/];
                }
            });
        });
    };
    QRSVG.prototype._createColor = function (_a) {
        var options = _a.options, color = _a.color, additionalRotation = _a.additionalRotation, x = _a.x, y = _a.y, height = _a.height, width = _a.width, name = _a.name;
        var size = width > height ? width : height;
        var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", String(x));
        rect.setAttribute("y", String(y));
        rect.setAttribute("height", String(height));
        rect.setAttribute("width", String(width));
        rect.setAttribute("clip-path", "url('#clip-path-".concat(name, "')"));
        if (options) {
            var gradient_1;
            if (options.type === _constants_gradientTypes__WEBPACK_IMPORTED_MODULE_6__["default"].radial) {
                gradient_1 = document.createElementNS("http://www.w3.org/2000/svg", "radialGradient");
                gradient_1.setAttribute("id", name);
                gradient_1.setAttribute("gradientUnits", "userSpaceOnUse");
                gradient_1.setAttribute("fx", String(x + width / 2));
                gradient_1.setAttribute("fy", String(y + height / 2));
                gradient_1.setAttribute("cx", String(x + width / 2));
                gradient_1.setAttribute("cy", String(y + height / 2));
                gradient_1.setAttribute("r", String(size / 2));
            }
            else {
                var rotation = ((options.rotation || 0) + additionalRotation) % (2 * Math.PI);
                var positiveRotation = (rotation + 2 * Math.PI) % (2 * Math.PI);
                var x0 = x + width / 2;
                var y0 = y + height / 2;
                var x1 = x + width / 2;
                var y1 = y + height / 2;
                if ((positiveRotation >= 0 && positiveRotation <= 0.25 * Math.PI) ||
                    (positiveRotation > 1.75 * Math.PI && positiveRotation <= 2 * Math.PI)) {
                    x0 = x0 - width / 2;
                    y0 = y0 - (height / 2) * Math.tan(rotation);
                    x1 = x1 + width / 2;
                    y1 = y1 + (height / 2) * Math.tan(rotation);
                }
                else if (positiveRotation > 0.25 * Math.PI && positiveRotation <= 0.75 * Math.PI) {
                    y0 = y0 - height / 2;
                    x0 = x0 - width / 2 / Math.tan(rotation);
                    y1 = y1 + height / 2;
                    x1 = x1 + width / 2 / Math.tan(rotation);
                }
                else if (positiveRotation > 0.75 * Math.PI && positiveRotation <= 1.25 * Math.PI) {
                    x0 = x0 + width / 2;
                    y0 = y0 + (height / 2) * Math.tan(rotation);
                    x1 = x1 - width / 2;
                    y1 = y1 - (height / 2) * Math.tan(rotation);
                }
                else if (positiveRotation > 1.25 * Math.PI && positiveRotation <= 1.75 * Math.PI) {
                    y0 = y0 + height / 2;
                    x0 = x0 + width / 2 / Math.tan(rotation);
                    y1 = y1 - height / 2;
                    x1 = x1 - width / 2 / Math.tan(rotation);
                }
                gradient_1 = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
                gradient_1.setAttribute("id", name);
                gradient_1.setAttribute("gradientUnits", "userSpaceOnUse");
                gradient_1.setAttribute("x1", String(Math.round(x0)));
                gradient_1.setAttribute("y1", String(Math.round(y0)));
                gradient_1.setAttribute("x2", String(Math.round(x1)));
                gradient_1.setAttribute("y2", String(Math.round(y1)));
            }
            options.colorStops.forEach(function (_a) {
                var offset = _a.offset, color = _a.color;
                var stop = document.createElementNS("http://www.w3.org/2000/svg", "stop");
                stop.setAttribute("offset", "".concat(100 * offset, "%"));
                stop.setAttribute("stop-color", color);
                gradient_1.appendChild(stop);
            });
            rect.setAttribute("fill", "url('#".concat(name, "')"));
            this._defs.appendChild(gradient_1);
        }
        else if (color) {
            rect.setAttribute("fill", color);
        }
        this._element.appendChild(rect);
    };
    return QRSVG;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (QRSVG);


/***/ }),

/***/ "./src/figures/cornerDot/QRCornerDot.ts":
/*!**********************************************!*\
  !*** ./src/figures/cornerDot/QRCornerDot.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _constants_cornerDotTypes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../constants/cornerDotTypes */ "./src/constants/cornerDotTypes.ts");
/* harmony import */ var _shapes_createHeartSVG__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../shapes/createHeartSVG */ "./src/shapes/createHeartSVG.ts");
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};


var QRCornerDot = /** @class */ (function () {
    function QRCornerDot(_a) {
        var svg = _a.svg, type = _a.type, color = _a.color;
        this._svg = svg;
        this._type = type;
        this._color = color;
    }
    QRCornerDot.prototype.draw = function (x, y, size, rotation) {
        var type = this._type;
        var drawFunction;
        switch (type) {
            case _constants_cornerDotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].square:
                drawFunction = this._drawSquare;
                break;
            case _constants_cornerDotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].heart:
                drawFunction = this._drawHeart;
                break;
            case _constants_cornerDotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].star:
                drawFunction = this._drawStar;
                break;
            case _constants_cornerDotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].dot:
            default:
                drawFunction = this._drawDot;
        }
        drawFunction.call(this, { x: x, y: y, size: size, rotation: rotation });
    };
    QRCornerDot.prototype._rotateFigure = function (_a) {
        var _b;
        var x = _a.x, y = _a.y, size = _a.size, _c = _a.rotation, rotation = _c === void 0 ? 0 : _c, draw = _a.draw;
        var cx = x + size / 2;
        var cy = y + size / 2;
        draw();
        (_b = this._element) === null || _b === void 0 ? void 0 : _b.setAttribute("transform", "rotate(".concat((180 * rotation) / Math.PI, ",").concat(cx, ",").concat(cy, ")"));
    };
    QRCornerDot.prototype._basicDot = function (args) {
        var _this = this;
        var size = args.size, x = args.x, y = args.y;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                _this._element = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                _this._element.setAttribute("cx", String(x + size / 2));
                _this._element.setAttribute("cy", String(y + size / 2));
                _this._element.setAttribute("r", String(size / 2));
            } }));
    };
    QRCornerDot.prototype._basicSquare = function (args) {
        var _this = this;
        var size = args.size, x = args.x, y = args.y;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                _this._element = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                _this._element.setAttribute("x", String(x));
                _this._element.setAttribute("y", String(y));
                _this._element.setAttribute("width", String(size));
                _this._element.setAttribute("height", String(size));
            } }));
    };
    QRCornerDot.prototype._basicHeart = function (args) {
        var _this = this;
        var x = args.x, y = args.y, size = args.size;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                var _a;
                var xmlns = "http://www.w3.org/2000/svg";
                // Note! We have to wrap the SVG with a foreignObject element in order to rotate it!!!
                var foreignObject = document.createElementNS(xmlns, "foreignObject");
                foreignObject.setAttribute("x", String(x));
                foreignObject.setAttribute("y", String(y));
                foreignObject.setAttribute("width", String(size));
                foreignObject.setAttribute("height", String(size));
                var svg = (0,_shapes_createHeartSVG__WEBPACK_IMPORTED_MODULE_1__.createHeartSVG)(size, (_a = _this._color) !== null && _a !== void 0 ? _a : "black");
                foreignObject.append(svg);
                // IMPORTANT! For embedded SVG corners: Append to 'this._svg' - NOT to 'this._element' because the latter would be added to a clipPath
                _this._svg.appendChild(foreignObject);
            } }));
    };
    QRCornerDot.prototype._drawDot = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, rotation = _a.rotation;
        this._basicDot({ x: x, y: y, size: size, rotation: rotation });
    };
    QRCornerDot.prototype._drawSquare = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, rotation = _a.rotation;
        this._basicSquare({ x: x, y: y, size: size, rotation: rotation });
    };
    QRCornerDot.prototype._drawHeart = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, rotation = _a.rotation;
        var scaleFactor = 0.2;
        this._basicHeart({
            x: x - (scaleFactor * size) / 2,
            y: y - (scaleFactor * size) / 2,
            size: size * (1 + scaleFactor),
            rotation: rotation
        });
    };
    QRCornerDot.prototype._drawStar = function (_a) {
        var _this = this;
        var x = _a.x, y = _a.y, size = _a.size, rotation = _a.rotation;
        var xmlns = "http://www.w3.org/2000/svg";
        var star = document.createElementNS(xmlns, "polygon");
        var cx = x + size / 2;
        var cy = y + size / 2;
        var r = size / 2;
        var points = [];
        for (var i = 0; i < 6; i++) {
            var x_1 = cx + r * Math.cos((i * 2 * Math.PI) / 5 - Math.PI / 2);
            var y_1 = cy + r * Math.sin((i * 2 * Math.PI) / 5 - Math.PI / 2);
            points.push("".concat(x_1, ",").concat(y_1));
        }
        star.setAttribute("points", points.join(" "));
        this._rotateFigure({
            x: x,
            y: y,
            size: size,
            draw: function () {
                _this._element = star;
            }
        });
    };
    return QRCornerDot;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (QRCornerDot);


/***/ }),

/***/ "./src/figures/cornerSquare/QRCornerSquare.ts":
/*!****************************************************!*\
  !*** ./src/figures/cornerSquare/QRCornerSquare.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _constants_cornerSquareTypes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../constants/cornerSquareTypes */ "./src/constants/cornerSquareTypes.ts");
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var QRCornerSquare = /** @class */ (function () {
    function QRCornerSquare(_a) {
        var svg = _a.svg, type = _a.type;
        this._svg = svg;
        this._type = type;
    }
    QRCornerSquare.prototype.draw = function (x, y, size, rotation) {
        var type = this._type;
        var drawFunction;
        switch (type) {
            case _constants_cornerSquareTypes__WEBPACK_IMPORTED_MODULE_0__["default"].square:
                drawFunction = this._drawSquare;
                break;
            case _constants_cornerSquareTypes__WEBPACK_IMPORTED_MODULE_0__["default"].extraRounded:
                drawFunction = this._drawExtraRounded;
                break;
            case _constants_cornerSquareTypes__WEBPACK_IMPORTED_MODULE_0__["default"].dot:
            default:
                drawFunction = this._drawDot;
        }
        drawFunction.call(this, { x: x, y: y, size: size, rotation: rotation });
    };
    QRCornerSquare.prototype._rotateFigure = function (_a) {
        var _b;
        var x = _a.x, y = _a.y, size = _a.size, _c = _a.rotation, rotation = _c === void 0 ? 0 : _c, draw = _a.draw;
        var cx = x + size / 2;
        var cy = y + size / 2;
        draw();
        (_b = this._element) === null || _b === void 0 ? void 0 : _b.setAttribute("transform", "rotate(".concat((180 * rotation) / Math.PI, ",").concat(cx, ",").concat(cy, ")"));
    };
    QRCornerSquare.prototype._basicDot = function (args) {
        var _this = this;
        var size = args.size, x = args.x, y = args.y;
        var dotSize = size / 7;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                _this._element = document.createElementNS("http://www.w3.org/2000/svg", "path");
                _this._element.setAttribute("clip-rule", "evenodd");
                _this._element.setAttribute("d", "M ".concat(x + size / 2, " ").concat(y) + // M cx, y //  Move to top of ring
                    "a ".concat(size / 2, " ").concat(size / 2, " 0 1 0 0.1 0") + // a outerRadius, outerRadius, 0, 1, 0, 1, 0 // Draw outer arc, but don't close it
                    "z" + // Z // Close the outer shape
                    "m 0 ".concat(dotSize) + // m -1 outerRadius-innerRadius // Move to top point of inner radius
                    "a ".concat(size / 2 - dotSize, " ").concat(size / 2 - dotSize, " 0 1 1 -0.1 0") + // a innerRadius, innerRadius, 0, 1, 1, -1, 0 // Draw inner arc, but don't close it
                    "Z" // Z // Close the inner ring. Actually will still work without, but inner ring will have one unit missing in stroke
                );
            } }));
    };
    QRCornerSquare.prototype._basicSquare = function (args) {
        var _this = this;
        var size = args.size, x = args.x, y = args.y;
        var dotSize = size / 7;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                _this._element = document.createElementNS("http://www.w3.org/2000/svg", "path");
                _this._element.setAttribute("clip-rule", "evenodd");
                _this._element.setAttribute("d", "M ".concat(x, " ").concat(y) +
                    "v ".concat(size) +
                    "h ".concat(size) +
                    "v ".concat(-size) +
                    "z" +
                    "M ".concat(x + dotSize, " ").concat(y + dotSize) +
                    "h ".concat(size - 2 * dotSize) +
                    "v ".concat(size - 2 * dotSize) +
                    "h ".concat(-size + 2 * dotSize) +
                    "z");
            } }));
    };
    QRCornerSquare.prototype._basicExtraRounded = function (args) {
        var _this = this;
        var size = args.size, x = args.x, y = args.y;
        var dotSize = size / 7;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                _this._element = document.createElementNS("http://www.w3.org/2000/svg", "path");
                _this._element.setAttribute("clip-rule", "evenodd");
                _this._element.setAttribute("d", "M ".concat(x, " ").concat(y + 2.5 * dotSize) +
                    "v ".concat(2 * dotSize) +
                    "a ".concat(2.5 * dotSize, " ").concat(2.5 * dotSize, ", 0, 0, 0, ").concat(dotSize * 2.5, " ").concat(dotSize * 2.5) +
                    "h ".concat(2 * dotSize) +
                    "a ".concat(2.5 * dotSize, " ").concat(2.5 * dotSize, ", 0, 0, 0, ").concat(dotSize * 2.5, " ").concat(-dotSize * 2.5) +
                    "v ".concat(-2 * dotSize) +
                    "a ".concat(2.5 * dotSize, " ").concat(2.5 * dotSize, ", 0, 0, 0, ").concat(-dotSize * 2.5, " ").concat(-dotSize * 2.5) +
                    "h ".concat(-2 * dotSize) +
                    "a ".concat(2.5 * dotSize, " ").concat(2.5 * dotSize, ", 0, 0, 0, ").concat(-dotSize * 2.5, " ").concat(dotSize * 2.5) +
                    "M ".concat(x + 2.5 * dotSize, " ").concat(y + dotSize) +
                    "h ".concat(2 * dotSize) +
                    "a ".concat(1.5 * dotSize, " ").concat(1.5 * dotSize, ", 0, 0, 1, ").concat(dotSize * 1.5, " ").concat(dotSize * 1.5) +
                    "v ".concat(2 * dotSize) +
                    "a ".concat(1.5 * dotSize, " ").concat(1.5 * dotSize, ", 0, 0, 1, ").concat(-dotSize * 1.5, " ").concat(dotSize * 1.5) +
                    "h ".concat(-2 * dotSize) +
                    "a ".concat(1.5 * dotSize, " ").concat(1.5 * dotSize, ", 0, 0, 1, ").concat(-dotSize * 1.5, " ").concat(-dotSize * 1.5) +
                    "v ".concat(-2 * dotSize) +
                    "a ".concat(1.5 * dotSize, " ").concat(1.5 * dotSize, ", 0, 0, 1, ").concat(dotSize * 1.5, " ").concat(-dotSize * 1.5));
            } }));
    };
    QRCornerSquare.prototype._drawDot = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, rotation = _a.rotation;
        this._basicDot({ x: x, y: y, size: size, rotation: rotation });
    };
    QRCornerSquare.prototype._drawSquare = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, rotation = _a.rotation;
        this._basicSquare({ x: x, y: y, size: size, rotation: rotation });
    };
    QRCornerSquare.prototype._drawExtraRounded = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, rotation = _a.rotation;
        this._basicExtraRounded({ x: x, y: y, size: size, rotation: rotation });
    };
    return QRCornerSquare;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (QRCornerSquare);


/***/ }),

/***/ "./src/figures/dot/QRDot.ts":
/*!**********************************!*\
  !*** ./src/figures/dot/QRDot.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../constants/dotTypes */ "./src/constants/dotTypes.ts");
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var QRDot = /** @class */ (function () {
    function QRDot(_a) {
        var svg = _a.svg, type = _a.type;
        this._svg = svg;
        this._type = type;
    }
    QRDot.prototype.draw = function (x, y, size, getNeighbor) {
        var type = this._type;
        var drawFunction;
        switch (type) {
            case _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].dots:
                drawFunction = this._drawDot;
                break;
            case _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].randomDots:
                drawFunction = this._drawRandomDot;
                break;
            case _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].classy:
                drawFunction = this._drawClassy;
                break;
            case _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].classyRounded:
                drawFunction = this._drawClassyRounded;
                break;
            case _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].rounded:
                drawFunction = this._drawRounded;
                break;
            case _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].verticalLines:
                drawFunction = this._drawVerticalLines;
                break;
            case _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].horizontalLines:
                drawFunction = this._drawHorizontalLines;
                break;
            case _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].extraRounded:
                drawFunction = this._drawExtraRounded;
                break;
            case _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].square:
            default:
                drawFunction = this._drawSquare;
        }
        drawFunction.call(this, { x: x, y: y, size: size, getNeighbor: getNeighbor });
    };
    QRDot.prototype._rotateFigure = function (_a) {
        var _b;
        var x = _a.x, y = _a.y, size = _a.size, _c = _a.rotation, rotation = _c === void 0 ? 0 : _c, draw = _a.draw;
        var cx = x + size / 2;
        var cy = y + size / 2;
        draw();
        (_b = this._element) === null || _b === void 0 ? void 0 : _b.setAttribute("transform", "rotate(".concat((180 * rotation) / Math.PI, ",").concat(cx, ",").concat(cy, ")"));
    };
    QRDot.prototype._basicDot = function (args) {
        var _this = this;
        var size = args.size, x = args.x, y = args.y;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                _this._element = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                _this._element.setAttribute("cx", String(x + size / 2));
                _this._element.setAttribute("cy", String(y + size / 2));
                _this._element.setAttribute("r", String(size / 2));
            } }));
    };
    QRDot.prototype._basicSquare = function (args) {
        var _this = this;
        var size = args.size, x = args.x, y = args.y;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                _this._element = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                _this._element.setAttribute("x", String(x));
                _this._element.setAttribute("y", String(y));
                _this._element.setAttribute("width", String(size));
                _this._element.setAttribute("height", String(size));
            } }));
    };
    //if rotation === 0 - right side is rounded
    QRDot.prototype._basicSideRounded = function (args) {
        var _this = this;
        var size = args.size, x = args.x, y = args.y;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                _this._element = document.createElementNS("http://www.w3.org/2000/svg", "path");
                _this._element.setAttribute("d", "M ".concat(x, " ").concat(y) + //go to top left position
                    "v ".concat(size) + //draw line to left bottom corner
                    "h ".concat(size / 2) + //draw line to left bottom corner + half of size right
                    "a ".concat(size / 2, " ").concat(size / 2, ", 0, 0, 0, 0 ").concat(-size) // draw rounded corner
                );
            } }));
    };
    //if rotation === 0 - top right corner is rounded
    QRDot.prototype._basicCornerRounded = function (args) {
        var _this = this;
        var size = args.size, x = args.x, y = args.y;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                _this._element = document.createElementNS("http://www.w3.org/2000/svg", "path");
                _this._element.setAttribute("d", "M ".concat(x, " ").concat(y) + //go to top left position
                    "v ".concat(size) + //draw line to left bottom corner
                    "h ".concat(size) + //draw line to right bottom corner
                    "v ".concat(-size / 2) + //draw line to right bottom corner + half of size top
                    "a ".concat(size / 2, " ").concat(size / 2, ", 0, 0, 0, ").concat(-size / 2, " ").concat(-size / 2) // draw rounded corner
                );
            } }));
    };
    //if rotation === 0 - top right corner is rounded
    QRDot.prototype._basicCornerExtraRounded = function (args) {
        var _this = this;
        var size = args.size, x = args.x, y = args.y;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                _this._element = document.createElementNS("http://www.w3.org/2000/svg", "path");
                _this._element.setAttribute("d", "M ".concat(x, " ").concat(y) + //go to top left position
                    "v ".concat(size) + //draw line to left bottom corner
                    "h ".concat(size) + //draw line to right bottom corner
                    "a ".concat(size, " ").concat(size, ", 0, 0, 0, ").concat(-size, " ").concat(-size) // draw rounded top right corner
                );
            } }));
    };
    //if rotation === 0 - left bottom and right top corners are rounded
    QRDot.prototype._basicCornersRounded = function (args) {
        var _this = this;
        var size = args.size, x = args.x, y = args.y;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                _this._element = document.createElementNS("http://www.w3.org/2000/svg", "path");
                _this._element.setAttribute("d", "M ".concat(x, " ").concat(y) + //go to left top position
                    "v ".concat(size / 2) + //draw line to left top corner + half of size bottom
                    "a ".concat(size / 2, " ").concat(size / 2, ", 0, 0, 0, ").concat(size / 2, " ").concat(size / 2) + // draw rounded left bottom corner
                    "h ".concat(size / 2) + //draw line to right bottom corner
                    "v ".concat(-size / 2) + //draw line to right bottom corner + half of size top
                    "a ".concat(size / 2, " ").concat(size / 2, ", 0, 0, 0, ").concat(-size / 2, " ").concat(-size / 2) // draw rounded right top corner
                );
            } }));
    };
    QRDot.prototype._drawDot = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size;
        this._basicDot({ x: x, y: y, size: size, rotation: 0 });
    };
    QRDot.prototype._drawRandomDot = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size;
        var randomFactor = Math.random() * (1 - 0.6) + 0.6;
        this._basicDot({ x: x, y: y, size: size * randomFactor, rotation: 0 });
    };
    QRDot.prototype._drawSquare = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size;
        this._basicSquare({ x: x, y: y, size: size, rotation: 0 });
    };
    QRDot.prototype._drawRounded = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, getNeighbor = _a.getNeighbor;
        var leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0;
        var rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0;
        var topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0;
        var bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0;
        var neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor;
        if (neighborsCount === 0) {
            this._basicDot({ x: x, y: y, size: size, rotation: 0 });
            return;
        }
        if (neighborsCount > 2 || (leftNeighbor && rightNeighbor) || (topNeighbor && bottomNeighbor)) {
            this._basicSquare({ x: x, y: y, size: size, rotation: 0 });
            return;
        }
        if (neighborsCount === 2) {
            var rotation = 0;
            if (leftNeighbor && topNeighbor) {
                rotation = Math.PI / 2;
            }
            else if (topNeighbor && rightNeighbor) {
                rotation = Math.PI;
            }
            else if (rightNeighbor && bottomNeighbor) {
                rotation = -Math.PI / 2;
            }
            this._basicCornerRounded({ x: x, y: y, size: size, rotation: rotation });
            return;
        }
        if (neighborsCount === 1) {
            var rotation = 0;
            if (topNeighbor) {
                rotation = Math.PI / 2;
            }
            else if (rightNeighbor) {
                rotation = Math.PI;
            }
            else if (bottomNeighbor) {
                rotation = -Math.PI / 2;
            }
            this._basicSideRounded({ x: x, y: y, size: size, rotation: rotation });
            return;
        }
    };
    QRDot.prototype._drawVerticalLines = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, getNeighbor = _a.getNeighbor;
        var leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0;
        var rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0;
        var topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0;
        var bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0;
        var neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor;
        if (neighborsCount === 0 ||
            (leftNeighbor && !(topNeighbor || bottomNeighbor)) ||
            (rightNeighbor && !(topNeighbor || bottomNeighbor))) {
            this._basicDot({ x: x, y: y, size: size, rotation: 0 });
            return;
        }
        if (topNeighbor && bottomNeighbor) {
            this._basicSquare({ x: x, y: y, size: size, rotation: 0 });
            return;
        }
        if (topNeighbor && !bottomNeighbor) {
            var rotation = Math.PI / 2;
            this._basicSideRounded({ x: x, y: y, size: size, rotation: rotation });
            return;
        }
        if (bottomNeighbor && !topNeighbor) {
            var rotation = -Math.PI / 2;
            this._basicSideRounded({ x: x, y: y, size: size, rotation: rotation });
            return;
        }
    };
    QRDot.prototype._drawHorizontalLines = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, getNeighbor = _a.getNeighbor;
        var leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0;
        var rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0;
        var topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0;
        var bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0;
        var neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor;
        if (neighborsCount === 0 ||
            (topNeighbor && !(leftNeighbor || rightNeighbor)) ||
            (bottomNeighbor && !(leftNeighbor || rightNeighbor))) {
            this._basicDot({ x: x, y: y, size: size, rotation: 0 });
            return;
        }
        if (leftNeighbor && rightNeighbor) {
            this._basicSquare({ x: x, y: y, size: size, rotation: 0 });
            return;
        }
        if (leftNeighbor && !rightNeighbor) {
            var rotation = 0;
            this._basicSideRounded({ x: x, y: y, size: size, rotation: rotation });
            return;
        }
        if (rightNeighbor && !leftNeighbor) {
            var rotation = Math.PI;
            this._basicSideRounded({ x: x, y: y, size: size, rotation: rotation });
            return;
        }
    };
    QRDot.prototype._drawExtraRounded = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, getNeighbor = _a.getNeighbor;
        var leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0;
        var rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0;
        var topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0;
        var bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0;
        var neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor;
        if (neighborsCount === 0) {
            this._basicDot({ x: x, y: y, size: size, rotation: 0 });
            return;
        }
        if (neighborsCount > 2 || (leftNeighbor && rightNeighbor) || (topNeighbor && bottomNeighbor)) {
            this._basicSquare({ x: x, y: y, size: size, rotation: 0 });
            return;
        }
        if (neighborsCount === 2) {
            var rotation = 0;
            if (leftNeighbor && topNeighbor) {
                rotation = Math.PI / 2;
            }
            else if (topNeighbor && rightNeighbor) {
                rotation = Math.PI;
            }
            else if (rightNeighbor && bottomNeighbor) {
                rotation = -Math.PI / 2;
            }
            this._basicCornerExtraRounded({ x: x, y: y, size: size, rotation: rotation });
            return;
        }
        if (neighborsCount === 1) {
            var rotation = 0;
            if (topNeighbor) {
                rotation = Math.PI / 2;
            }
            else if (rightNeighbor) {
                rotation = Math.PI;
            }
            else if (bottomNeighbor) {
                rotation = -Math.PI / 2;
            }
            this._basicSideRounded({ x: x, y: y, size: size, rotation: rotation });
            return;
        }
    };
    QRDot.prototype._drawClassy = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, getNeighbor = _a.getNeighbor;
        var leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0;
        var rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0;
        var topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0;
        var bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0;
        var neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor;
        if (neighborsCount === 0) {
            this._basicCornersRounded({ x: x, y: y, size: size, rotation: Math.PI / 2 });
            return;
        }
        if (!leftNeighbor && !topNeighbor) {
            this._basicCornerRounded({ x: x, y: y, size: size, rotation: -Math.PI / 2 });
            return;
        }
        if (!rightNeighbor && !bottomNeighbor) {
            this._basicCornerRounded({ x: x, y: y, size: size, rotation: Math.PI / 2 });
            return;
        }
        this._basicSquare({ x: x, y: y, size: size, rotation: 0 });
    };
    QRDot.prototype._drawClassyRounded = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, getNeighbor = _a.getNeighbor;
        var leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0;
        var rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0;
        var topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0;
        var bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0;
        var neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor;
        if (neighborsCount === 0) {
            this._basicCornersRounded({ x: x, y: y, size: size, rotation: Math.PI / 2 });
            return;
        }
        if (!leftNeighbor && !topNeighbor) {
            this._basicCornerExtraRounded({ x: x, y: y, size: size, rotation: -Math.PI / 2 });
            return;
        }
        if (!rightNeighbor && !bottomNeighbor) {
            this._basicCornerExtraRounded({ x: x, y: y, size: size, rotation: Math.PI / 2 });
            return;
        }
        this._basicSquare({ x: x, y: y, size: size, rotation: 0 });
    };
    return QRDot;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (QRDot);


/***/ }),

/***/ "./src/shapes/createHeartSVG.ts":
/*!**************************************!*\
  !*** ./src/shapes/createHeartSVG.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createHeartSVG: () => (/* binding */ createHeartSVG)
/* harmony export */ });
function createHeartSVG(size, color) {
    var xmlns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(xmlns, "svg");
    svg.setAttribute("width", size.toString());
    svg.setAttribute("height", size.toString());
    svg.setAttribute("viewBox", "0 -960 960 960");
    svg.setAttribute("fill", color);
    var path = document.createElementNS(xmlns, "path");
    path.setAttribute("d", "m480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-634q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810-447.5Q771-395 705-329T538-172l-58 52Z");
    svg.appendChild(path);
    return svg;
}


/***/ }),

/***/ "./src/tools/calculateImageSize.ts":
/*!*****************************************!*\
  !*** ./src/tools/calculateImageSize.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ calculateImageSize)
/* harmony export */ });
function calculateImageSize(_a) {
    var originalHeight = _a.originalHeight, originalWidth = _a.originalWidth, maxHiddenDots = _a.maxHiddenDots, maxHiddenAxisDots = _a.maxHiddenAxisDots, dotSize = _a.dotSize;
    var hideDots = { x: 0, y: 0 };
    var imageSize = { x: 0, y: 0 };
    if (originalHeight <= 0 || originalWidth <= 0 || maxHiddenDots <= 0 || dotSize <= 0) {
        return {
            height: 0,
            width: 0,
            hideYDots: 0,
            hideXDots: 0
        };
    }
    var k = originalHeight / originalWidth;
    //Getting the maximum possible axis hidden dots
    hideDots.x = Math.floor(Math.sqrt(maxHiddenDots / k));
    //The count of hidden dot's can't be less than 1
    if (hideDots.x <= 0)
        hideDots.x = 1;
    //Check the limit of the maximum allowed axis hidden dots
    if (maxHiddenAxisDots && maxHiddenAxisDots < hideDots.x)
        hideDots.x = maxHiddenAxisDots;
    //The count of dots should be odd
    if (hideDots.x % 2 === 0)
        hideDots.x--;
    imageSize.x = hideDots.x * dotSize;
    //Calculate opposite axis hidden dots based on axis value.
    //The value will be odd.
    //We use ceil to prevent dots covering by the image.
    hideDots.y = 1 + 2 * Math.ceil((hideDots.x * k - 1) / 2);
    imageSize.y = Math.round(imageSize.x * k);
    //If the result dots count is bigger than max - then decrease size and calculate again
    if (hideDots.y * hideDots.x > maxHiddenDots || (maxHiddenAxisDots && maxHiddenAxisDots < hideDots.y)) {
        if (maxHiddenAxisDots && maxHiddenAxisDots < hideDots.y) {
            hideDots.y = maxHiddenAxisDots;
            if (hideDots.y % 2 === 0)
                hideDots.x--;
        }
        else {
            hideDots.y -= 2;
        }
        imageSize.y = hideDots.y * dotSize;
        hideDots.x = 1 + 2 * Math.ceil((hideDots.y / k - 1) / 2);
        imageSize.x = Math.round(imageSize.y / k);
    }
    return {
        height: imageSize.y,
        width: imageSize.x,
        hideYDots: hideDots.y,
        hideXDots: hideDots.x
    };
}


/***/ }),

/***/ "./src/tools/downloadURI.ts":
/*!**********************************!*\
  !*** ./src/tools/downloadURI.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ downloadURI)
/* harmony export */ });
function downloadURI(uri, name) {
    var link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


/***/ }),

/***/ "./src/tools/getMode.ts":
/*!******************************!*\
  !*** ./src/tools/getMode.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ getMode)
/* harmony export */ });
/* harmony import */ var _constants_modes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/modes */ "./src/constants/modes.ts");

function getMode(data) {
    switch (true) {
        case /^[0-9]*$/.test(data):
            return _constants_modes__WEBPACK_IMPORTED_MODULE_0__["default"].numeric;
        case /^[0-9A-Z $%*+\-./:]*$/.test(data):
            return _constants_modes__WEBPACK_IMPORTED_MODULE_0__["default"].alphanumeric;
        default:
            return _constants_modes__WEBPACK_IMPORTED_MODULE_0__["default"].byte;
    }
}


/***/ }),

/***/ "./src/tools/merge.ts":
/*!****************************!*\
  !*** ./src/tools/merge.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ mergeDeep)
/* harmony export */ });
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (undefined && undefined.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var isObject = function (obj) { return !!obj && typeof obj === "object" && !Array.isArray(obj); };
function mergeDeep(target) {
    var sources = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        sources[_i - 1] = arguments[_i];
    }
    if (!sources.length)
        return target;
    var source = sources.shift();
    if (source === undefined || !isObject(target) || !isObject(source))
        return target;
    target = __assign({}, target);
    Object.keys(source).forEach(function (key) {
        var targetValue = target[key];
        var sourceValue = source[key];
        if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
            target[key] = sourceValue;
        }
        else if (isObject(targetValue) && isObject(sourceValue)) {
            target[key] = mergeDeep(Object.assign({}, targetValue), sourceValue);
        }
        else {
            target[key] = sourceValue;
        }
    });
    return mergeDeep.apply(void 0, __spreadArray([target], sources, false));
}


/***/ }),

/***/ "./src/tools/sanitizeOptions.ts":
/*!**************************************!*\
  !*** ./src/tools/sanitizeOptions.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ sanitizeOptions)
/* harmony export */ });
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
function sanitizeGradient(gradient) {
    var newGradient = __assign({}, gradient);
    if (!newGradient.colorStops || !newGradient.colorStops.length) {
        throw "Field 'colorStops' is required in gradient";
    }
    if (newGradient.rotation) {
        newGradient.rotation = Number(newGradient.rotation);
    }
    else {
        newGradient.rotation = 0;
    }
    newGradient.colorStops = newGradient.colorStops.map(function (colorStop) { return (__assign(__assign({}, colorStop), { offset: Number(colorStop.offset) })); });
    return newGradient;
}
function sanitizeOptions(options) {
    var newOptions = __assign({}, options);
    newOptions.width = Number(newOptions.width);
    newOptions.height = Number(newOptions.height);
    newOptions.margin = Number(newOptions.margin);
    newOptions.imageOptions = __assign(__assign({}, newOptions.imageOptions), { hideBackgroundDots: Boolean(newOptions.imageOptions.hideBackgroundDots), imageSize: Number(newOptions.imageOptions.imageSize), margin: Number(newOptions.imageOptions.margin) });
    if (newOptions.margin > Math.min(newOptions.width, newOptions.height)) {
        newOptions.margin = Math.min(newOptions.width, newOptions.height);
    }
    newOptions.dotsOptions = __assign({}, newOptions.dotsOptions);
    if (newOptions.dotsOptions.gradient) {
        newOptions.dotsOptions.gradient = sanitizeGradient(newOptions.dotsOptions.gradient);
    }
    if (newOptions.cornersSquareOptions) {
        newOptions.cornersSquareOptions = __assign({}, newOptions.cornersSquareOptions);
        if (newOptions.cornersSquareOptions.gradient) {
            newOptions.cornersSquareOptions.gradient = sanitizeGradient(newOptions.cornersSquareOptions.gradient);
        }
    }
    if (newOptions.cornersDotOptions) {
        newOptions.cornersDotOptions = __assign({}, newOptions.cornersDotOptions);
        if (newOptions.cornersDotOptions.gradient) {
            newOptions.cornersDotOptions.gradient = sanitizeGradient(newOptions.cornersDotOptions.gradient);
        }
    }
    if (newOptions.backgroundOptions) {
        newOptions.backgroundOptions = __assign({}, newOptions.backgroundOptions);
        if (newOptions.backgroundOptions.gradient) {
            newOptions.backgroundOptions.gradient = sanitizeGradient(newOptions.backgroundOptions.gradient);
        }
    }
    return newOptions;
}


/***/ }),

/***/ "./src/tools/toDataUrl.ts":
/*!********************************!*\
  !*** ./src/tools/toDataUrl.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ toDataURL)
/* harmony export */ });
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
function toDataURL(url) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) {
                    var xhr = new XMLHttpRequest();
                    xhr.onload = function () {
                        var reader = new FileReader();
                        reader.onloadend = function () {
                            resolve(reader.result);
                        };
                        reader.readAsDataURL(xhr.response);
                    };
                    xhr.open("GET", url);
                    xhr.responseType = "blob";
                    xhr.send();
                })];
        });
    });
}


/***/ }),

/***/ "./src/types/index.ts":
/*!****************************!*\
  !*** ./src/types/index.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);



/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   cornerDotTypes: () => (/* reexport safe */ _constants_cornerDotTypes__WEBPACK_IMPORTED_MODULE_2__["default"]),
/* harmony export */   cornerSquareTypes: () => (/* reexport safe */ _constants_cornerSquareTypes__WEBPACK_IMPORTED_MODULE_3__["default"]),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   dotTypes: () => (/* reexport safe */ _constants_dotTypes__WEBPACK_IMPORTED_MODULE_1__["default"]),
/* harmony export */   drawTypes: () => (/* reexport safe */ _constants_drawTypes__WEBPACK_IMPORTED_MODULE_8__["default"]),
/* harmony export */   errorCorrectionLevels: () => (/* reexport safe */ _constants_errorCorrectionLevels__WEBPACK_IMPORTED_MODULE_4__["default"]),
/* harmony export */   errorCorrectionPercents: () => (/* reexport safe */ _constants_errorCorrectionPercents__WEBPACK_IMPORTED_MODULE_5__["default"]),
/* harmony export */   gradientTypes: () => (/* reexport safe */ _constants_gradientTypes__WEBPACK_IMPORTED_MODULE_10__["default"]),
/* harmony export */   modes: () => (/* reexport safe */ _constants_modes__WEBPACK_IMPORTED_MODULE_6__["default"]),
/* harmony export */   qrTypes: () => (/* reexport safe */ _constants_qrTypes__WEBPACK_IMPORTED_MODULE_7__["default"]),
/* harmony export */   shapeTypes: () => (/* reexport safe */ _constants_shapeTypes__WEBPACK_IMPORTED_MODULE_9__["default"])
/* harmony export */ });
/* harmony import */ var _core_QRCodeStyling__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./core/QRCodeStyling */ "./src/core/QRCodeStyling.ts");
/* harmony import */ var _constants_dotTypes__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./constants/dotTypes */ "./src/constants/dotTypes.ts");
/* harmony import */ var _constants_cornerDotTypes__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./constants/cornerDotTypes */ "./src/constants/cornerDotTypes.ts");
/* harmony import */ var _constants_cornerSquareTypes__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./constants/cornerSquareTypes */ "./src/constants/cornerSquareTypes.ts");
/* harmony import */ var _constants_errorCorrectionLevels__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./constants/errorCorrectionLevels */ "./src/constants/errorCorrectionLevels.ts");
/* harmony import */ var _constants_errorCorrectionPercents__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./constants/errorCorrectionPercents */ "./src/constants/errorCorrectionPercents.ts");
/* harmony import */ var _constants_modes__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./constants/modes */ "./src/constants/modes.ts");
/* harmony import */ var _constants_qrTypes__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./constants/qrTypes */ "./src/constants/qrTypes.ts");
/* harmony import */ var _constants_drawTypes__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./constants/drawTypes */ "./src/constants/drawTypes.ts");
/* harmony import */ var _constants_shapeTypes__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./constants/shapeTypes */ "./src/constants/shapeTypes.ts");
/* harmony import */ var _constants_gradientTypes__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./constants/gradientTypes */ "./src/constants/gradientTypes.ts");
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./types */ "./src/types/index.ts");













/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_core_QRCodeStyling__WEBPACK_IMPORTED_MODULE_0__["default"]);

})();

__webpack_exports__ = __webpack_exports__["default"];
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBLGdDQUFnQztBQUNoQztBQUNBLGdDQUFnQztBQUNoQztBQUNBLGdDQUFnQztBQUNoQztBQUNBLGdDQUFnQztBQUNoQztBQUNBLGdDQUFnQztBQUNoQztBQUNBLGdDQUFnQztBQUNoQztBQUNBLGdDQUFnQztBQUNoQztBQUNBLGdDQUFnQzs7QUFFaEM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHNCQUFzQix3QkFBd0I7QUFDOUM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxRQUFROztBQUVSOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsUUFBUTs7QUFFUjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUEsd0JBQXdCLG1CQUFtQjtBQUMzQywwQkFBMEIsbUJBQW1COztBQUU3QztBQUNBOztBQUVBLDJCQUEyQixRQUFROztBQUVuQztBQUNBO0FBQ0E7O0FBRUEsNkJBQTZCLFFBQVE7O0FBRXJDO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBLHdCQUF3Qix1QkFBdUI7QUFDL0MsMEJBQTBCLHVCQUF1QjtBQUNqRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSx3QkFBd0IsbUJBQW1CO0FBQzNDLDBCQUEwQix1QkFBdUI7QUFDakQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSx3QkFBd0IsbUJBQW1CO0FBQzNDLDBCQUEwQix1QkFBdUI7QUFDakQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQSx3QkFBd0IsbUJBQW1CO0FBQzNDLDBCQUEwQixtQkFBbUI7QUFDN0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0Esb0JBQW9CLE9BQU87QUFDM0I7QUFDQTtBQUNBLG9CQUFvQixTQUFTO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsU0FBUztBQUM3QjtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IseUJBQXlCO0FBQy9DO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQSxzQkFBc0IsdUJBQXVCO0FBQzdDLHdCQUF3QixtQkFBbUI7QUFDM0M7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0Esc0JBQXNCLHVCQUF1QjtBQUM3QztBQUNBOztBQUVBLHNCQUFzQixtQkFBbUI7QUFDekM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQSxzQkFBc0IsWUFBWTs7QUFFbEM7QUFDQTtBQUNBOztBQUVBLHdCQUF3QixXQUFXO0FBQ25DO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxzQkFBc0IsWUFBWTtBQUNsQztBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHNCQUFzQixjQUFjO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0Esc0JBQXNCLG1CQUFtQjtBQUN6QztBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQixTQUFTO0FBQy9CO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHNCQUFzQixjQUFjO0FBQ3BDO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLG1CQUFtQjtBQUN6QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQSxRQUFRO0FBQ1I7QUFDQSxRQUFRO0FBQ1I7QUFDQSxRQUFRO0FBQ1I7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsWUFBWTtBQUNwQztBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0EsUUFBUTtBQUNSO0FBQ0EsUUFBUTtBQUNSO0FBQ0EsUUFBUTtBQUNSO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBLDJCQUEyQjtBQUMzQjtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHdCQUF3QjtBQUN4Qjs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsc0JBQXNCLGVBQWU7QUFDckM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQSxVQUFVOztBQUVWOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLG9CQUFvQixZQUFZO0FBQ2hDLHNCQUFzQixXQUFXO0FBQ2pDO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxvQkFBb0Isa0JBQWtCO0FBQ3RDO0FBQ0E7QUFDQTs7QUFFQSwyQkFBMkI7QUFDM0I7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixnQkFBZ0I7QUFDcEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxDQUFDOztBQUVEO0FBQ0EsTUFBTSxJQUEwQztBQUNoRCxNQUFNLGlDQUFPLEVBQUUsb0NBQUUsT0FBTztBQUFBO0FBQUE7QUFBQSxrR0FBQztBQUN6QixJQUFJLEtBQUssRUFFTjtBQUNILENBQUM7QUFDRDtBQUNBLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7QUN0dkVELGlFQUFlO0lBQ2IsR0FBRyxFQUFFLEtBQUs7SUFDVixNQUFNLEVBQUUsUUFBUTtJQUNoQixLQUFLLEVBQUUsT0FBTztJQUNkLElBQUksRUFBRSxNQUFNLENBQUMsaUNBQWlDO0NBQzdCLEVBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7QUNMcEIsaUVBQWU7SUFDYixHQUFHLEVBQUUsS0FBSztJQUNWLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLFlBQVksRUFBRSxlQUFlO0NBQ1QsRUFBQzs7Ozs7Ozs7Ozs7Ozs7OztBQ0p2QixpRUFBZTtJQUNiLElBQUksRUFBRSxNQUFNO0lBQ1osVUFBVSxFQUFFLGFBQWE7SUFDekIsT0FBTyxFQUFFLFNBQVM7SUFDbEIsYUFBYSxFQUFFLGdCQUFnQjtJQUMvQixlQUFlLEVBQUUsa0JBQWtCO0lBQ25DLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLGFBQWEsRUFBRSxnQkFBZ0I7SUFDL0IsTUFBTSxFQUFFLFFBQVE7SUFDaEIsWUFBWSxFQUFFLGVBQWU7Q0FDbEIsRUFBQzs7Ozs7Ozs7Ozs7Ozs7OztBQ1ZkLGlFQUFlO0lBQ2IsTUFBTSxFQUFFLFFBQVE7SUFDaEIsR0FBRyxFQUFFLEtBQUs7Q0FDRSxFQUFDOzs7Ozs7Ozs7Ozs7Ozs7O0FDQ2YsaUVBQWU7SUFDYixDQUFDLEVBQUUsR0FBRztJQUNOLENBQUMsRUFBRSxHQUFHO0lBQ04sQ0FBQyxFQUFFLEdBQUc7SUFDTixDQUFDLEVBQUUsR0FBRztDQUNrQixFQUFDOzs7Ozs7Ozs7Ozs7Ozs7O0FDUDNCLGlFQUFlO0lBQ2IsQ0FBQyxFQUFFLElBQUk7SUFDUCxDQUFDLEVBQUUsSUFBSTtJQUNQLENBQUMsRUFBRSxJQUFJO0lBQ1AsQ0FBQyxFQUFFLEdBQUc7Q0FDb0IsRUFBQzs7Ozs7Ozs7Ozs7Ozs7OztBQ1A3QixpRUFBZTtJQUNiLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLE1BQU0sRUFBRSxRQUFRO0NBQ0EsRUFBQzs7Ozs7Ozs7Ozs7Ozs7OztBQ0NuQixpRUFBZTtJQUNiLE9BQU8sRUFBRSxTQUFTO0lBQ2xCLFlBQVksRUFBRSxjQUFjO0lBQzVCLElBQUksRUFBRSxNQUFNO0lBQ1osS0FBSyxFQUFFLE9BQU87Q0FDTixFQUFDOzs7Ozs7Ozs7Ozs7Ozs7O0FDTFgsSUFBTSxPQUFPLEdBQWEsRUFBRSxDQUFDO0FBRTdCLEtBQUssSUFBSSxJQUFJLEdBQUcsQ0FBQyxFQUFFLElBQUksSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUU7SUFDckMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQWtCLENBQUM7Q0FDcEM7QUFFRCx3QkFBd0I7QUFFeEIsWUFBWTtBQUNaLFlBQVk7QUFDWixZQUFZO0FBQ1osVUFBVTtBQUNWLGFBQWE7QUFDYixJQUFJO0FBRUosaUVBQWUsT0FBTyxFQUFDOzs7Ozs7Ozs7Ozs7Ozs7O0FDbkJ2QixpRUFBZTtJQUNiLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLE1BQU0sRUFBRSxRQUFRO0NBQ0gsRUFBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0x1QjtBQUNBO0FBQ1E7QUFDbkI7QUFDbUI7QUFFZTtBQUNQO0FBRWpCO0FBRXRDO0lBVUUsdUJBQVksT0FBMEI7UUFDcEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLGtFQUFlLENBQUMsd0RBQVMsQ0FBQyxrREFBYyxFQUFFLE9BQU8sQ0FBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxrREFBYyxDQUFDO1FBQ2xILElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUNoQixDQUFDO0lBRU0sNkJBQWUsR0FBdEIsVUFBdUIsU0FBdUI7UUFDNUMsSUFBSSxTQUFTLEVBQUU7WUFDYixTQUFTLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztTQUMxQjtJQUNILENBQUM7SUFFRCxpQ0FBUyxHQUFUO1FBQUEsaUJBV0M7UUFWQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNiLE9BQU87U0FDUjtRQUNELElBQU0sS0FBSyxHQUFHLElBQUksOENBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFdkMsSUFBSSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDL0IsSUFBSSxDQUFDLGtCQUFrQixHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQzs7WUFDcEQsSUFBSSxDQUFDLEtBQUksQ0FBQyxJQUFJO2dCQUFFLE9BQU87WUFDdkIsV0FBSSxDQUFDLFVBQVUsc0RBQUcsS0FBSyxDQUFDLFVBQVUsRUFBRSxFQUFFLEtBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN2RCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxvQ0FBWSxHQUFaO1FBQUEsaUJBNEJDOztRQTNCQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNiLE9BQU87U0FDUjtRQUVELElBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNoRCxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztRQUN6QyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztRQUUzQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDakIsSUFBSSxDQUFDLHFCQUFxQixHQUFHLFVBQUksQ0FBQyxrQkFBa0IsMENBQUUsSUFBSSxDQUFDO1lBQ3pELElBQUksQ0FBQyxLQUFJLENBQUMsSUFBSTtnQkFBRSxPQUFPO1lBRXZCLElBQU0sR0FBRyxHQUFHLEtBQUksQ0FBQyxJQUFJLENBQUM7WUFDdEIsSUFBTSxHQUFHLEdBQUcsSUFBSSxhQUFhLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN2RCxJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDeEIsSUFBTSxPQUFPLEdBQUcsNEJBQTRCLEdBQUcsS0FBSyxDQUFDO1lBQ3JELElBQU0sS0FBSyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7WUFFMUIsT0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU87Z0JBQ3pCLEtBQUssQ0FBQyxNQUFNLEdBQUc7O29CQUNiLGlCQUFJLENBQUMsT0FBTywwQ0FBRSxVQUFVLENBQUMsSUFBSSxDQUFDLDBDQUFFLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUN2RCxPQUFPLEVBQUUsQ0FBQztnQkFDWixDQUFDLENBQUM7Z0JBRUYsS0FBSyxDQUFDLEdBQUcsR0FBRyxPQUFPLENBQUM7WUFDdEIsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFSyxtQ0FBVyxHQUFqQixVQUFrQixTQUFnQztRQUFoQyw2Q0FBZ0M7Ozs7O3dCQUNoRCxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUc7NEJBQUUsTUFBTSxrQkFBa0IsQ0FBQzs2QkFFcEMsVUFBUyxDQUFDLFdBQVcsRUFBRSxLQUFLLEtBQUssR0FBakMsd0JBQWlDO3dCQUNuQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRTs0QkFDMUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO3lCQUNsQjt3QkFDRCxxQkFBTSxJQUFJLENBQUMsa0JBQWtCOzt3QkFBN0IsU0FBNkIsQ0FBQzt3QkFDOUIsc0JBQU8sSUFBSSxDQUFDLElBQUksRUFBQzs7d0JBRWpCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLHFCQUFxQixFQUFFOzRCQUNoRCxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7eUJBQ3JCO3dCQUNELHFCQUFNLElBQUksQ0FBQyxxQkFBcUI7O3dCQUFoQyxTQUFnQyxDQUFDO3dCQUNqQyxzQkFBTyxJQUFJLENBQUMsT0FBTyxFQUFDOzs7O0tBRXZCO0lBRUQsOEJBQU0sR0FBTixVQUFPLE9BQTBCO1FBQy9CLGFBQWEsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQy9DLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxrRUFBZSxDQUFDLHdEQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQW9CLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUVoSCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUU7WUFDdkIsT0FBTztTQUNSO1FBRUQsSUFBSSxDQUFDLEdBQUcsR0FBRyx1REFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQ3BHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksSUFBSSwwREFBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNsRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO1FBRWhCLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEtBQUssNERBQVMsQ0FBQyxNQUFNLEVBQUU7WUFDM0MsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1NBQ3JCO2FBQU07WUFDTCxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7U0FDbEI7UUFFRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRUQsOEJBQU0sR0FBTixVQUFPLFNBQXVCO1FBQzVCLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDZCxPQUFPO1NBQ1I7UUFFRCxJQUFJLE9BQU8sU0FBUyxDQUFDLFdBQVcsS0FBSyxVQUFVLEVBQUU7WUFDL0MsTUFBTSx1Q0FBdUMsQ0FBQztTQUMvQztRQUVELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEtBQUssNERBQVMsQ0FBQyxNQUFNLEVBQUU7WUFDM0MsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNoQixTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUNyQztTQUNGO2FBQU07WUFDTCxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ2IsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDbEM7U0FDRjtRQUVELElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO0lBQzlCLENBQUM7SUFFRCxzQ0FBYyxHQUFkLFVBQWUsU0FBNEI7UUFDekMsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNkLE1BQU0sdUNBQXVDLENBQUM7U0FDL0M7UUFFRCxJQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztRQUM1QixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDaEIsQ0FBQztJQUVELHVDQUFlLEdBQWY7UUFDRSxJQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztRQUM1QixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDaEIsQ0FBQztJQUVLLGtDQUFVLEdBQWhCLFVBQWlCLFNBQWdDO1FBQWhDLDZDQUFnQzs7Ozs7O3dCQUMvQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUc7NEJBQUUsTUFBTSxrQkFBa0IsQ0FBQzt3QkFDeEIscUJBQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUM7O3dCQUEzQyxPQUFPLEdBQUcsU0FBaUM7d0JBRWpELElBQUksQ0FBQyxPQUFPLEVBQUU7NEJBQ1osc0JBQU8sSUFBSSxFQUFDO3lCQUNiO3dCQUVELElBQUksU0FBUyxDQUFDLFdBQVcsRUFBRSxLQUFLLEtBQUssRUFBRTs0QkFDL0IsVUFBVSxHQUFHLElBQUksYUFBYSxFQUFFLENBQUM7NEJBQ2pDLE1BQU0sR0FBRyxVQUFVLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLENBQUM7NEJBRXJELHNCQUFPLElBQUksSUFBSSxDQUFDLENBQUMsMkNBQTJDLEdBQUcsTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFFLENBQUMsRUFBQzt5QkFDcEc7NkJBQU07NEJBQ0wsc0JBQU8sSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLElBQUssT0FBQyxPQUE2QixDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsZ0JBQVMsU0FBUyxDQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQXZFLENBQXVFLENBQUMsRUFBQzt5QkFDMUc7Ozs7O0tBQ0Y7SUFFSyxnQ0FBUSxHQUFkLFVBQWUsZUFBbUQ7Ozs7Ozt3QkFDaEUsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHOzRCQUFFLE1BQU0sa0JBQWtCLENBQUM7d0JBQ3BDLFNBQVMsR0FBRyxLQUFzQixDQUFDO3dCQUNuQyxJQUFJLEdBQUcsSUFBSSxDQUFDO3dCQUVoQix1Q0FBdUM7d0JBQ3ZDLElBQUksT0FBTyxlQUFlLEtBQUssUUFBUSxFQUFFOzRCQUN2QyxTQUFTLEdBQUcsZUFBZ0MsQ0FBQzs0QkFDN0MsT0FBTyxDQUFDLElBQUksQ0FDViw2SEFBNkgsQ0FDOUgsQ0FBQzt5QkFDSDs2QkFBTSxJQUFJLE9BQU8sZUFBZSxLQUFLLFFBQVEsSUFBSSxlQUFlLEtBQUssSUFBSSxFQUFFOzRCQUMxRSxJQUFJLGVBQWUsQ0FBQyxJQUFJLEVBQUU7Z0NBQ3hCLElBQUksR0FBRyxlQUFlLENBQUMsSUFBSSxDQUFDOzZCQUM3Qjs0QkFDRCxJQUFJLGVBQWUsQ0FBQyxTQUFTLEVBQUU7Z0NBQzdCLFNBQVMsR0FBRyxlQUFlLENBQUMsU0FBUyxDQUFDOzZCQUN2Qzt5QkFDRjt3QkFFZSxxQkFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQzs7d0JBQTNDLE9BQU8sR0FBRyxTQUFpQzt3QkFFakQsSUFBSSxDQUFDLE9BQU8sRUFBRTs0QkFDWixzQkFBTzt5QkFDUjt3QkFFRCxJQUFJLFNBQVMsQ0FBQyxXQUFXLEVBQUUsS0FBSyxLQUFLLEVBQUU7NEJBQy9CLFVBQVUsR0FBRyxJQUFJLGFBQWEsRUFBRSxDQUFDOzRCQUNuQyxNQUFNLEdBQUcsVUFBVSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDOzRCQUVuRCxNQUFNLEdBQUcsMkNBQTJDLEdBQUcsTUFBTSxDQUFDOzRCQUN4RCxHQUFHLEdBQUcsbUNBQW1DLEdBQUcsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUM7NEJBQzdFLDhEQUFXLENBQUMsR0FBRyxFQUFFLFVBQUcsSUFBSSxTQUFNLENBQUMsQ0FBQzt5QkFDakM7NkJBQU07NEJBQ0MsR0FBRyxHQUFJLE9BQTZCLENBQUMsU0FBUyxDQUFDLGdCQUFTLFNBQVMsQ0FBRSxDQUFDLENBQUM7NEJBQzNFLDhEQUFXLENBQUMsR0FBRyxFQUFFLFVBQUcsSUFBSSxjQUFJLFNBQVMsQ0FBRSxDQUFDLENBQUM7eUJBQzFDOzs7OztLQUNGO0lBQ0gsb0JBQUM7QUFBRCxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM5TTBDO0FBQ0k7QUFDRTtBQUNzQjtBQWlDdkUsSUFBTSxjQUFjLEdBQW9CO0lBQ3RDLElBQUksRUFBRSw0REFBUyxDQUFDLE1BQU07SUFDdEIsS0FBSyxFQUFFLDZEQUFVLENBQUMsTUFBTTtJQUN4QixLQUFLLEVBQUUsR0FBRztJQUNWLE1BQU0sRUFBRSxHQUFHO0lBQ1gsSUFBSSxFQUFFLEVBQUU7SUFDUixNQUFNLEVBQUUsQ0FBQztJQUNULFNBQVMsRUFBRTtRQUNULFVBQVUsRUFBRSwwREFBTyxDQUFDLENBQUMsQ0FBQztRQUN0QixJQUFJLEVBQUUsU0FBUztRQUNmLG9CQUFvQixFQUFFLHdFQUFxQixDQUFDLENBQUM7S0FDOUM7SUFDRCxZQUFZLEVBQUU7UUFDWixrQkFBa0IsRUFBRSxJQUFJO1FBQ3hCLFNBQVMsRUFBRSxHQUFHO1FBQ2QsV0FBVyxFQUFFLFNBQVM7UUFDdEIsTUFBTSxFQUFFLENBQUM7S0FDVjtJQUNELFdBQVcsRUFBRTtRQUNYLElBQUksRUFBRSxRQUFRO1FBQ2QsS0FBSyxFQUFFLE1BQU07S0FDZDtJQUNELGlCQUFpQixFQUFFO1FBQ2pCLEtBQUssRUFBRSxDQUFDO1FBQ1IsS0FBSyxFQUFFLE1BQU07S0FDZDtDQUNGLENBQUM7QUFFRixpRUFBZSxjQUFjLEVBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ2hFK0I7QUFDbEI7QUFDZ0M7QUFDbEM7QUFDMkI7QUFDVDtBQUVKO0FBQ047QUFHakQsSUFBTSxVQUFVLEdBQUc7SUFDakIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDckIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDckIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDckIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDckIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDckIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDckIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7Q0FDdEIsQ0FBQztBQUVGLElBQU0sT0FBTyxHQUFHO0lBQ2QsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDckIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDckIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDckIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDckIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDckIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFB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STtBQUNJO0FBQ0U7QUFDTTtBQUU5QjtBQWF0QjtBQUVGLGlFQUFlLDJEQUFhLEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9RUkNvZGVTdHlsaW5nL3dlYnBhY2svdW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbiIsIndlYnBhY2s6Ly9RUkNvZGVTdHlsaW5nLy4vbm9kZV9tb2R1bGVzL3FyY29kZS1nZW5lcmF0b3IvcXJjb2RlLmpzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9zcmMvY29uc3RhbnRzL2Nvcm5lckRvdFR5cGVzLnRzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9zcmMvY29uc3RhbnRzL2Nvcm5lclNxdWFyZVR5cGVzLnRzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9zcmMvY29uc3RhbnRzL2RvdFR5cGVzLnRzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9zcmMvY29uc3RhbnRzL2RyYXdUeXBlcy50cyIsIndlYnBhY2s6Ly9RUkNvZGVTdHlsaW5nLy4vc3JjL2NvbnN0YW50cy9lcnJvckNvcnJlY3Rpb25MZXZlbHMudHMiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy8uL3NyYy9jb25zdGFudHMvZXJyb3JDb3JyZWN0aW9uUGVyY2VudHMudHMiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy8uL3NyYy9jb25zdGFudHMvZ3JhZGllbnRUeXBlcy50cyIsIndlYnBhY2s6Ly9RUkNvZGVTdHlsaW5nLy4vc3JjL2NvbnN0YW50cy9tb2Rlcy50cyIsIndlYnBhY2s6Ly9RUkNvZGVTdHlsaW5nLy4vc3JjL2NvbnN0YW50cy9xclR5cGVzLnRzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9zcmMvY29uc3RhbnRzL3NoYXBlVHlwZXMudHMiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy8uL3NyYy9jb3JlL1FSQ29kZVN0eWxpbmcudHMiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy8uL3NyYy9jb3JlL1FST3B0aW9ucy50cyIsIndlYnBhY2s6Ly9RUkNvZGVTdHlsaW5nLy4vc3JjL2NvcmUvUVJTVkcudHMiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy8uL3NyYy9maWd1cmVzL2Nvcm5lckRvdC9RUkNvcm5lckRvdC50cyIsIndlYnBhY2s6Ly9RUkNvZGVTdHlsaW5nLy4vc3JjL2ZpZ3VyZXMvY29ybmVyU3F1YXJlL1FSQ29ybmVyU3F1YXJlLnRzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9zcmMvZmlndXJlcy9kb3QvUVJEb3QudHMiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy8uL3NyYy9zaGFwZXMvY3JlYXRlSGVhcnRTVkcudHMiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy8uL3NyYy90b29scy9jYWxjdWxhdGVJbWFnZVNpemUudHMiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy8uL3NyYy90b29scy9kb3dubG9hZFVSSS50cyIsIndlYnBhY2s6Ly9RUkNvZGVTdHlsaW5nLy4vc3JjL3Rvb2xzL2dldE1vZGUudHMiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy8uL3NyYy90b29scy9tZXJnZS50cyIsIndlYnBhY2s6Ly9RUkNvZGVTdHlsaW5nLy4vc3JjL3Rvb2xzL3Nhbml0aXplT3B0aW9ucy50cyIsIndlYnBhY2s6Ly9RUkNvZGVTdHlsaW5nLy4vc3JjL3Rvb2xzL3RvRGF0YVVybC50cyIsIndlYnBhY2s6Ly9RUkNvZGVTdHlsaW5nLy4vc3JjL3R5cGVzL2luZGV4LnRzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy93ZWJwYWNrL3J1bnRpbWUvY29tcGF0IGdldCBkZWZhdWx0IGV4cG9ydCIsIndlYnBhY2s6Ly9RUkNvZGVTdHlsaW5nL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9RUkNvZGVTdHlsaW5nL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoW10sIGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1wiUVJDb2RlU3R5bGluZ1wiXSA9IGZhY3RvcnkoKTtcblx0ZWxzZVxuXHRcdHJvb3RbXCJRUkNvZGVTdHlsaW5nXCJdID0gZmFjdG9yeSgpO1xufSkoc2VsZiwgKCkgPT4ge1xucmV0dXJuICIsIi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vL1xuLy8gUVIgQ29kZSBHZW5lcmF0b3IgZm9yIEphdmFTY3JpcHRcbi8vXG4vLyBDb3B5cmlnaHQgKGMpIDIwMDkgS2F6dWhpa28gQXJhc2Vcbi8vXG4vLyBVUkw6IGh0dHA6Ly93d3cuZC1wcm9qZWN0LmNvbS9cbi8vXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XG4vLyAgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbi8vXG4vLyBUaGUgd29yZCAnUVIgQ29kZScgaXMgcmVnaXN0ZXJlZCB0cmFkZW1hcmsgb2Zcbi8vIERFTlNPIFdBVkUgSU5DT1JQT1JBVEVEXG4vLyAgaHR0cDovL3d3dy5kZW5zby13YXZlLmNvbS9xcmNvZGUvZmFxcGF0ZW50LWUuaHRtbFxuLy9cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBxcmNvZGUgPSBmdW5jdGlvbigpIHtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBxcmNvZGVcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvKipcbiAgICogcXJjb2RlXG4gICAqIEBwYXJhbSB0eXBlTnVtYmVyIDEgdG8gNDBcbiAgICogQHBhcmFtIGVycm9yQ29ycmVjdGlvbkxldmVsICdMJywnTScsJ1EnLCdIJ1xuICAgKi9cbiAgdmFyIHFyY29kZSA9IGZ1bmN0aW9uKHR5cGVOdW1iZXIsIGVycm9yQ29ycmVjdGlvbkxldmVsKSB7XG5cbiAgICB2YXIgUEFEMCA9IDB4RUM7XG4gICAgdmFyIFBBRDEgPSAweDExO1xuXG4gICAgdmFyIF90eXBlTnVtYmVyID0gdHlwZU51bWJlcjtcbiAgICB2YXIgX2Vycm9yQ29ycmVjdGlvbkxldmVsID0gUVJFcnJvckNvcnJlY3Rpb25MZXZlbFtlcnJvckNvcnJlY3Rpb25MZXZlbF07XG4gICAgdmFyIF9tb2R1bGVzID0gbnVsbDtcbiAgICB2YXIgX21vZHVsZUNvdW50ID0gMDtcbiAgICB2YXIgX2RhdGFDYWNoZSA9IG51bGw7XG4gICAgdmFyIF9kYXRhTGlzdCA9IFtdO1xuXG4gICAgdmFyIF90aGlzID0ge307XG5cbiAgICB2YXIgbWFrZUltcGwgPSBmdW5jdGlvbih0ZXN0LCBtYXNrUGF0dGVybikge1xuXG4gICAgICBfbW9kdWxlQ291bnQgPSBfdHlwZU51bWJlciAqIDQgKyAxNztcbiAgICAgIF9tb2R1bGVzID0gZnVuY3Rpb24obW9kdWxlQ291bnQpIHtcbiAgICAgICAgdmFyIG1vZHVsZXMgPSBuZXcgQXJyYXkobW9kdWxlQ291bnQpO1xuICAgICAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCBtb2R1bGVDb3VudDsgcm93ICs9IDEpIHtcbiAgICAgICAgICBtb2R1bGVzW3Jvd10gPSBuZXcgQXJyYXkobW9kdWxlQ291bnQpO1xuICAgICAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IG1vZHVsZUNvdW50OyBjb2wgKz0gMSkge1xuICAgICAgICAgICAgbW9kdWxlc1tyb3ddW2NvbF0gPSBudWxsO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbW9kdWxlcztcbiAgICAgIH0oX21vZHVsZUNvdW50KTtcblxuICAgICAgc2V0dXBQb3NpdGlvblByb2JlUGF0dGVybigwLCAwKTtcbiAgICAgIHNldHVwUG9zaXRpb25Qcm9iZVBhdHRlcm4oX21vZHVsZUNvdW50IC0gNywgMCk7XG4gICAgICBzZXR1cFBvc2l0aW9uUHJvYmVQYXR0ZXJuKDAsIF9tb2R1bGVDb3VudCAtIDcpO1xuICAgICAgc2V0dXBQb3NpdGlvbkFkanVzdFBhdHRlcm4oKTtcbiAgICAgIHNldHVwVGltaW5nUGF0dGVybigpO1xuICAgICAgc2V0dXBUeXBlSW5mbyh0ZXN0LCBtYXNrUGF0dGVybik7XG5cbiAgICAgIGlmIChfdHlwZU51bWJlciA+PSA3KSB7XG4gICAgICAgIHNldHVwVHlwZU51bWJlcih0ZXN0KTtcbiAgICAgIH1cblxuICAgICAgaWYgKF9kYXRhQ2FjaGUgPT0gbnVsbCkge1xuICAgICAgICBfZGF0YUNhY2hlID0gY3JlYXRlRGF0YShfdHlwZU51bWJlciwgX2Vycm9yQ29ycmVjdGlvbkxldmVsLCBfZGF0YUxpc3QpO1xuICAgICAgfVxuXG4gICAgICBtYXBEYXRhKF9kYXRhQ2FjaGUsIG1hc2tQYXR0ZXJuKTtcbiAgICB9O1xuXG4gICAgdmFyIHNldHVwUG9zaXRpb25Qcm9iZVBhdHRlcm4gPSBmdW5jdGlvbihyb3csIGNvbCkge1xuXG4gICAgICBmb3IgKHZhciByID0gLTE7IHIgPD0gNzsgciArPSAxKSB7XG5cbiAgICAgICAgaWYgKHJvdyArIHIgPD0gLTEgfHwgX21vZHVsZUNvdW50IDw9IHJvdyArIHIpIGNvbnRpbnVlO1xuXG4gICAgICAgIGZvciAodmFyIGMgPSAtMTsgYyA8PSA3OyBjICs9IDEpIHtcblxuICAgICAgICAgIGlmIChjb2wgKyBjIDw9IC0xIHx8IF9tb2R1bGVDb3VudCA8PSBjb2wgKyBjKSBjb250aW51ZTtcblxuICAgICAgICAgIGlmICggKDAgPD0gciAmJiByIDw9IDYgJiYgKGMgPT0gMCB8fCBjID09IDYpIClcbiAgICAgICAgICAgICAgfHwgKDAgPD0gYyAmJiBjIDw9IDYgJiYgKHIgPT0gMCB8fCByID09IDYpIClcbiAgICAgICAgICAgICAgfHwgKDIgPD0gciAmJiByIDw9IDQgJiYgMiA8PSBjICYmIGMgPD0gNCkgKSB7XG4gICAgICAgICAgICBfbW9kdWxlc1tyb3cgKyByXVtjb2wgKyBjXSA9IHRydWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF9tb2R1bGVzW3JvdyArIHJdW2NvbCArIGNdID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciBnZXRCZXN0TWFza1BhdHRlcm4gPSBmdW5jdGlvbigpIHtcblxuICAgICAgdmFyIG1pbkxvc3RQb2ludCA9IDA7XG4gICAgICB2YXIgcGF0dGVybiA9IDA7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgODsgaSArPSAxKSB7XG5cbiAgICAgICAgbWFrZUltcGwodHJ1ZSwgaSk7XG5cbiAgICAgICAgdmFyIGxvc3RQb2ludCA9IFFSVXRpbC5nZXRMb3N0UG9pbnQoX3RoaXMpO1xuXG4gICAgICAgIGlmIChpID09IDAgfHwgbWluTG9zdFBvaW50ID4gbG9zdFBvaW50KSB7XG4gICAgICAgICAgbWluTG9zdFBvaW50ID0gbG9zdFBvaW50O1xuICAgICAgICAgIHBhdHRlcm4gPSBpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwYXR0ZXJuO1xuICAgIH07XG5cbiAgICB2YXIgc2V0dXBUaW1pbmdQYXR0ZXJuID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgIGZvciAodmFyIHIgPSA4OyByIDwgX21vZHVsZUNvdW50IC0gODsgciArPSAxKSB7XG4gICAgICAgIGlmIChfbW9kdWxlc1tyXVs2XSAhPSBudWxsKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgX21vZHVsZXNbcl1bNl0gPSAociAlIDIgPT0gMCk7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGMgPSA4OyBjIDwgX21vZHVsZUNvdW50IC0gODsgYyArPSAxKSB7XG4gICAgICAgIGlmIChfbW9kdWxlc1s2XVtjXSAhPSBudWxsKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgX21vZHVsZXNbNl1bY10gPSAoYyAlIDIgPT0gMCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciBzZXR1cFBvc2l0aW9uQWRqdXN0UGF0dGVybiA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICB2YXIgcG9zID0gUVJVdGlsLmdldFBhdHRlcm5Qb3NpdGlvbihfdHlwZU51bWJlcik7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcG9zLmxlbmd0aDsgaSArPSAxKSB7XG5cbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBwb3MubGVuZ3RoOyBqICs9IDEpIHtcblxuICAgICAgICAgIHZhciByb3cgPSBwb3NbaV07XG4gICAgICAgICAgdmFyIGNvbCA9IHBvc1tqXTtcblxuICAgICAgICAgIGlmIChfbW9kdWxlc1tyb3ddW2NvbF0gIT0gbnVsbCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZm9yICh2YXIgciA9IC0yOyByIDw9IDI7IHIgKz0gMSkge1xuXG4gICAgICAgICAgICBmb3IgKHZhciBjID0gLTI7IGMgPD0gMjsgYyArPSAxKSB7XG5cbiAgICAgICAgICAgICAgaWYgKHIgPT0gLTIgfHwgciA9PSAyIHx8IGMgPT0gLTIgfHwgYyA9PSAyXG4gICAgICAgICAgICAgICAgICB8fCAociA9PSAwICYmIGMgPT0gMCkgKSB7XG4gICAgICAgICAgICAgICAgX21vZHVsZXNbcm93ICsgcl1bY29sICsgY10gPSB0cnVlO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIF9tb2R1bGVzW3JvdyArIHJdW2NvbCArIGNdID0gZmFsc2U7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIHNldHVwVHlwZU51bWJlciA9IGZ1bmN0aW9uKHRlc3QpIHtcblxuICAgICAgdmFyIGJpdHMgPSBRUlV0aWwuZ2V0QkNIVHlwZU51bWJlcihfdHlwZU51bWJlcik7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTg7IGkgKz0gMSkge1xuICAgICAgICB2YXIgbW9kID0gKCF0ZXN0ICYmICggKGJpdHMgPj4gaSkgJiAxKSA9PSAxKTtcbiAgICAgICAgX21vZHVsZXNbTWF0aC5mbG9vcihpIC8gMyldW2kgJSAzICsgX21vZHVsZUNvdW50IC0gOCAtIDNdID0gbW9kO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDE4OyBpICs9IDEpIHtcbiAgICAgICAgdmFyIG1vZCA9ICghdGVzdCAmJiAoIChiaXRzID4+IGkpICYgMSkgPT0gMSk7XG4gICAgICAgIF9tb2R1bGVzW2kgJSAzICsgX21vZHVsZUNvdW50IC0gOCAtIDNdW01hdGguZmxvb3IoaSAvIDMpXSA9IG1vZDtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIHNldHVwVHlwZUluZm8gPSBmdW5jdGlvbih0ZXN0LCBtYXNrUGF0dGVybikge1xuXG4gICAgICB2YXIgZGF0YSA9IChfZXJyb3JDb3JyZWN0aW9uTGV2ZWwgPDwgMykgfCBtYXNrUGF0dGVybjtcbiAgICAgIHZhciBiaXRzID0gUVJVdGlsLmdldEJDSFR5cGVJbmZvKGRhdGEpO1xuXG4gICAgICAvLyB2ZXJ0aWNhbFxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxNTsgaSArPSAxKSB7XG5cbiAgICAgICAgdmFyIG1vZCA9ICghdGVzdCAmJiAoIChiaXRzID4+IGkpICYgMSkgPT0gMSk7XG5cbiAgICAgICAgaWYgKGkgPCA2KSB7XG4gICAgICAgICAgX21vZHVsZXNbaV1bOF0gPSBtb2Q7XG4gICAgICAgIH0gZWxzZSBpZiAoaSA8IDgpIHtcbiAgICAgICAgICBfbW9kdWxlc1tpICsgMV1bOF0gPSBtb2Q7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgX21vZHVsZXNbX21vZHVsZUNvdW50IC0gMTUgKyBpXVs4XSA9IG1vZDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBob3Jpem9udGFsXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDE1OyBpICs9IDEpIHtcblxuICAgICAgICB2YXIgbW9kID0gKCF0ZXN0ICYmICggKGJpdHMgPj4gaSkgJiAxKSA9PSAxKTtcblxuICAgICAgICBpZiAoaSA8IDgpIHtcbiAgICAgICAgICBfbW9kdWxlc1s4XVtfbW9kdWxlQ291bnQgLSBpIC0gMV0gPSBtb2Q7XG4gICAgICAgIH0gZWxzZSBpZiAoaSA8IDkpIHtcbiAgICAgICAgICBfbW9kdWxlc1s4XVsxNSAtIGkgLSAxICsgMV0gPSBtb2Q7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgX21vZHVsZXNbOF1bMTUgLSBpIC0gMV0gPSBtb2Q7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gZml4ZWQgbW9kdWxlXG4gICAgICBfbW9kdWxlc1tfbW9kdWxlQ291bnQgLSA4XVs4XSA9ICghdGVzdCk7XG4gICAgfTtcblxuICAgIHZhciBtYXBEYXRhID0gZnVuY3Rpb24oZGF0YSwgbWFza1BhdHRlcm4pIHtcblxuICAgICAgdmFyIGluYyA9IC0xO1xuICAgICAgdmFyIHJvdyA9IF9tb2R1bGVDb3VudCAtIDE7XG4gICAgICB2YXIgYml0SW5kZXggPSA3O1xuICAgICAgdmFyIGJ5dGVJbmRleCA9IDA7XG4gICAgICB2YXIgbWFza0Z1bmMgPSBRUlV0aWwuZ2V0TWFza0Z1bmN0aW9uKG1hc2tQYXR0ZXJuKTtcblxuICAgICAgZm9yICh2YXIgY29sID0gX21vZHVsZUNvdW50IC0gMTsgY29sID4gMDsgY29sIC09IDIpIHtcblxuICAgICAgICBpZiAoY29sID09IDYpIGNvbCAtPSAxO1xuXG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG5cbiAgICAgICAgICBmb3IgKHZhciBjID0gMDsgYyA8IDI7IGMgKz0gMSkge1xuXG4gICAgICAgICAgICBpZiAoX21vZHVsZXNbcm93XVtjb2wgLSBjXSA9PSBudWxsKSB7XG5cbiAgICAgICAgICAgICAgdmFyIGRhcmsgPSBmYWxzZTtcblxuICAgICAgICAgICAgICBpZiAoYnl0ZUluZGV4IDwgZGF0YS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBkYXJrID0gKCAoIChkYXRhW2J5dGVJbmRleF0gPj4+IGJpdEluZGV4KSAmIDEpID09IDEpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgdmFyIG1hc2sgPSBtYXNrRnVuYyhyb3csIGNvbCAtIGMpO1xuXG4gICAgICAgICAgICAgIGlmIChtYXNrKSB7XG4gICAgICAgICAgICAgICAgZGFyayA9ICFkYXJrO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgX21vZHVsZXNbcm93XVtjb2wgLSBjXSA9IGRhcms7XG4gICAgICAgICAgICAgIGJpdEluZGV4IC09IDE7XG5cbiAgICAgICAgICAgICAgaWYgKGJpdEluZGV4ID09IC0xKSB7XG4gICAgICAgICAgICAgICAgYnl0ZUluZGV4ICs9IDE7XG4gICAgICAgICAgICAgICAgYml0SW5kZXggPSA3O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcm93ICs9IGluYztcblxuICAgICAgICAgIGlmIChyb3cgPCAwIHx8IF9tb2R1bGVDb3VudCA8PSByb3cpIHtcbiAgICAgICAgICAgIHJvdyAtPSBpbmM7XG4gICAgICAgICAgICBpbmMgPSAtaW5jO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciBjcmVhdGVCeXRlcyA9IGZ1bmN0aW9uKGJ1ZmZlciwgcnNCbG9ja3MpIHtcblxuICAgICAgdmFyIG9mZnNldCA9IDA7XG5cbiAgICAgIHZhciBtYXhEY0NvdW50ID0gMDtcbiAgICAgIHZhciBtYXhFY0NvdW50ID0gMDtcblxuICAgICAgdmFyIGRjZGF0YSA9IG5ldyBBcnJheShyc0Jsb2Nrcy5sZW5ndGgpO1xuICAgICAgdmFyIGVjZGF0YSA9IG5ldyBBcnJheShyc0Jsb2Nrcy5sZW5ndGgpO1xuXG4gICAgICBmb3IgKHZhciByID0gMDsgciA8IHJzQmxvY2tzLmxlbmd0aDsgciArPSAxKSB7XG5cbiAgICAgICAgdmFyIGRjQ291bnQgPSByc0Jsb2Nrc1tyXS5kYXRhQ291bnQ7XG4gICAgICAgIHZhciBlY0NvdW50ID0gcnNCbG9ja3Nbcl0udG90YWxDb3VudCAtIGRjQ291bnQ7XG5cbiAgICAgICAgbWF4RGNDb3VudCA9IE1hdGgubWF4KG1heERjQ291bnQsIGRjQ291bnQpO1xuICAgICAgICBtYXhFY0NvdW50ID0gTWF0aC5tYXgobWF4RWNDb3VudCwgZWNDb3VudCk7XG5cbiAgICAgICAgZGNkYXRhW3JdID0gbmV3IEFycmF5KGRjQ291bnQpO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGNkYXRhW3JdLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgZGNkYXRhW3JdW2ldID0gMHhmZiAmIGJ1ZmZlci5nZXRCdWZmZXIoKVtpICsgb2Zmc2V0XTtcbiAgICAgICAgfVxuICAgICAgICBvZmZzZXQgKz0gZGNDb3VudDtcblxuICAgICAgICB2YXIgcnNQb2x5ID0gUVJVdGlsLmdldEVycm9yQ29ycmVjdFBvbHlub21pYWwoZWNDb3VudCk7XG4gICAgICAgIHZhciByYXdQb2x5ID0gcXJQb2x5bm9taWFsKGRjZGF0YVtyXSwgcnNQb2x5LmdldExlbmd0aCgpIC0gMSk7XG5cbiAgICAgICAgdmFyIG1vZFBvbHkgPSByYXdQb2x5Lm1vZChyc1BvbHkpO1xuICAgICAgICBlY2RhdGFbcl0gPSBuZXcgQXJyYXkocnNQb2x5LmdldExlbmd0aCgpIC0gMSk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWNkYXRhW3JdLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgdmFyIG1vZEluZGV4ID0gaSArIG1vZFBvbHkuZ2V0TGVuZ3RoKCkgLSBlY2RhdGFbcl0ubGVuZ3RoO1xuICAgICAgICAgIGVjZGF0YVtyXVtpXSA9IChtb2RJbmRleCA+PSAwKT8gbW9kUG9seS5nZXRBdChtb2RJbmRleCkgOiAwO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHZhciB0b3RhbENvZGVDb3VudCA9IDA7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJzQmxvY2tzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHRvdGFsQ29kZUNvdW50ICs9IHJzQmxvY2tzW2ldLnRvdGFsQ291bnQ7XG4gICAgICB9XG5cbiAgICAgIHZhciBkYXRhID0gbmV3IEFycmF5KHRvdGFsQ29kZUNvdW50KTtcbiAgICAgIHZhciBpbmRleCA9IDA7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbWF4RGNDb3VudDsgaSArPSAxKSB7XG4gICAgICAgIGZvciAodmFyIHIgPSAwOyByIDwgcnNCbG9ja3MubGVuZ3RoOyByICs9IDEpIHtcbiAgICAgICAgICBpZiAoaSA8IGRjZGF0YVtyXS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGRhdGFbaW5kZXhdID0gZGNkYXRhW3JdW2ldO1xuICAgICAgICAgICAgaW5kZXggKz0gMTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtYXhFY0NvdW50OyBpICs9IDEpIHtcbiAgICAgICAgZm9yICh2YXIgciA9IDA7IHIgPCByc0Jsb2Nrcy5sZW5ndGg7IHIgKz0gMSkge1xuICAgICAgICAgIGlmIChpIDwgZWNkYXRhW3JdLmxlbmd0aCkge1xuICAgICAgICAgICAgZGF0YVtpbmRleF0gPSBlY2RhdGFbcl1baV07XG4gICAgICAgICAgICBpbmRleCArPSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9O1xuXG4gICAgdmFyIGNyZWF0ZURhdGEgPSBmdW5jdGlvbih0eXBlTnVtYmVyLCBlcnJvckNvcnJlY3Rpb25MZXZlbCwgZGF0YUxpc3QpIHtcblxuICAgICAgdmFyIHJzQmxvY2tzID0gUVJSU0Jsb2NrLmdldFJTQmxvY2tzKHR5cGVOdW1iZXIsIGVycm9yQ29ycmVjdGlvbkxldmVsKTtcblxuICAgICAgdmFyIGJ1ZmZlciA9IHFyQml0QnVmZmVyKCk7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YUxpc3QubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgdmFyIGRhdGEgPSBkYXRhTGlzdFtpXTtcbiAgICAgICAgYnVmZmVyLnB1dChkYXRhLmdldE1vZGUoKSwgNCk7XG4gICAgICAgIGJ1ZmZlci5wdXQoZGF0YS5nZXRMZW5ndGgoKSwgUVJVdGlsLmdldExlbmd0aEluQml0cyhkYXRhLmdldE1vZGUoKSwgdHlwZU51bWJlcikgKTtcbiAgICAgICAgZGF0YS53cml0ZShidWZmZXIpO1xuICAgICAgfVxuXG4gICAgICAvLyBjYWxjIG51bSBtYXggZGF0YS5cbiAgICAgIHZhciB0b3RhbERhdGFDb3VudCA9IDA7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJzQmxvY2tzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHRvdGFsRGF0YUNvdW50ICs9IHJzQmxvY2tzW2ldLmRhdGFDb3VudDtcbiAgICAgIH1cblxuICAgICAgaWYgKGJ1ZmZlci5nZXRMZW5ndGhJbkJpdHMoKSA+IHRvdGFsRGF0YUNvdW50ICogOCkge1xuICAgICAgICB0aHJvdyAnY29kZSBsZW5ndGggb3ZlcmZsb3cuICgnXG4gICAgICAgICAgKyBidWZmZXIuZ2V0TGVuZ3RoSW5CaXRzKClcbiAgICAgICAgICArICc+J1xuICAgICAgICAgICsgdG90YWxEYXRhQ291bnQgKiA4XG4gICAgICAgICAgKyAnKSc7XG4gICAgICB9XG5cbiAgICAgIC8vIGVuZCBjb2RlXG4gICAgICBpZiAoYnVmZmVyLmdldExlbmd0aEluQml0cygpICsgNCA8PSB0b3RhbERhdGFDb3VudCAqIDgpIHtcbiAgICAgICAgYnVmZmVyLnB1dCgwLCA0KTtcbiAgICAgIH1cblxuICAgICAgLy8gcGFkZGluZ1xuICAgICAgd2hpbGUgKGJ1ZmZlci5nZXRMZW5ndGhJbkJpdHMoKSAlIDggIT0gMCkge1xuICAgICAgICBidWZmZXIucHV0Qml0KGZhbHNlKTtcbiAgICAgIH1cblxuICAgICAgLy8gcGFkZGluZ1xuICAgICAgd2hpbGUgKHRydWUpIHtcblxuICAgICAgICBpZiAoYnVmZmVyLmdldExlbmd0aEluQml0cygpID49IHRvdGFsRGF0YUNvdW50ICogOCkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGJ1ZmZlci5wdXQoUEFEMCwgOCk7XG5cbiAgICAgICAgaWYgKGJ1ZmZlci5nZXRMZW5ndGhJbkJpdHMoKSA+PSB0b3RhbERhdGFDb3VudCAqIDgpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBidWZmZXIucHV0KFBBRDEsIDgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gY3JlYXRlQnl0ZXMoYnVmZmVyLCByc0Jsb2Nrcyk7XG4gICAgfTtcblxuICAgIF90aGlzLmFkZERhdGEgPSBmdW5jdGlvbihkYXRhLCBtb2RlKSB7XG5cbiAgICAgIG1vZGUgPSBtb2RlIHx8ICdCeXRlJztcblxuICAgICAgdmFyIG5ld0RhdGEgPSBudWxsO1xuXG4gICAgICBzd2l0Y2gobW9kZSkge1xuICAgICAgY2FzZSAnTnVtZXJpYycgOlxuICAgICAgICBuZXdEYXRhID0gcXJOdW1iZXIoZGF0YSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnQWxwaGFudW1lcmljJyA6XG4gICAgICAgIG5ld0RhdGEgPSBxckFscGhhTnVtKGRhdGEpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ0J5dGUnIDpcbiAgICAgICAgbmV3RGF0YSA9IHFyOEJpdEJ5dGUoZGF0YSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnS2FuamknIDpcbiAgICAgICAgbmV3RGF0YSA9IHFyS2FuamkoZGF0YSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdCA6XG4gICAgICAgIHRocm93ICdtb2RlOicgKyBtb2RlO1xuICAgICAgfVxuXG4gICAgICBfZGF0YUxpc3QucHVzaChuZXdEYXRhKTtcbiAgICAgIF9kYXRhQ2FjaGUgPSBudWxsO1xuICAgIH07XG5cbiAgICBfdGhpcy5pc0RhcmsgPSBmdW5jdGlvbihyb3csIGNvbCkge1xuICAgICAgaWYgKHJvdyA8IDAgfHwgX21vZHVsZUNvdW50IDw9IHJvdyB8fCBjb2wgPCAwIHx8IF9tb2R1bGVDb3VudCA8PSBjb2wpIHtcbiAgICAgICAgdGhyb3cgcm93ICsgJywnICsgY29sO1xuICAgICAgfVxuICAgICAgcmV0dXJuIF9tb2R1bGVzW3Jvd11bY29sXTtcbiAgICB9O1xuXG4gICAgX3RoaXMuZ2V0TW9kdWxlQ291bnQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfbW9kdWxlQ291bnQ7XG4gICAgfTtcblxuICAgIF90aGlzLm1ha2UgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChfdHlwZU51bWJlciA8IDEpIHtcbiAgICAgICAgdmFyIHR5cGVOdW1iZXIgPSAxO1xuXG4gICAgICAgIGZvciAoOyB0eXBlTnVtYmVyIDwgNDA7IHR5cGVOdW1iZXIrKykge1xuICAgICAgICAgIHZhciByc0Jsb2NrcyA9IFFSUlNCbG9jay5nZXRSU0Jsb2Nrcyh0eXBlTnVtYmVyLCBfZXJyb3JDb3JyZWN0aW9uTGV2ZWwpO1xuICAgICAgICAgIHZhciBidWZmZXIgPSBxckJpdEJ1ZmZlcigpO1xuXG4gICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBfZGF0YUxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gX2RhdGFMaXN0W2ldO1xuICAgICAgICAgICAgYnVmZmVyLnB1dChkYXRhLmdldE1vZGUoKSwgNCk7XG4gICAgICAgICAgICBidWZmZXIucHV0KGRhdGEuZ2V0TGVuZ3RoKCksIFFSVXRpbC5nZXRMZW5ndGhJbkJpdHMoZGF0YS5nZXRNb2RlKCksIHR5cGVOdW1iZXIpICk7XG4gICAgICAgICAgICBkYXRhLndyaXRlKGJ1ZmZlcik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIHRvdGFsRGF0YUNvdW50ID0gMDtcbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJzQmxvY2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0b3RhbERhdGFDb3VudCArPSByc0Jsb2Nrc1tpXS5kYXRhQ291bnQ7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGJ1ZmZlci5nZXRMZW5ndGhJbkJpdHMoKSA8PSB0b3RhbERhdGFDb3VudCAqIDgpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIF90eXBlTnVtYmVyID0gdHlwZU51bWJlcjtcbiAgICAgIH1cblxuICAgICAgbWFrZUltcGwoZmFsc2UsIGdldEJlc3RNYXNrUGF0dGVybigpICk7XG4gICAgfTtcblxuICAgIF90aGlzLmNyZWF0ZVRhYmxlVGFnID0gZnVuY3Rpb24oY2VsbFNpemUsIG1hcmdpbikge1xuXG4gICAgICBjZWxsU2l6ZSA9IGNlbGxTaXplIHx8IDI7XG4gICAgICBtYXJnaW4gPSAodHlwZW9mIG1hcmdpbiA9PSAndW5kZWZpbmVkJyk/IGNlbGxTaXplICogNCA6IG1hcmdpbjtcblxuICAgICAgdmFyIHFySHRtbCA9ICcnO1xuXG4gICAgICBxckh0bWwgKz0gJzx0YWJsZSBzdHlsZT1cIic7XG4gICAgICBxckh0bWwgKz0gJyBib3JkZXItd2lkdGg6IDBweDsgYm9yZGVyLXN0eWxlOiBub25lOyc7XG4gICAgICBxckh0bWwgKz0gJyBib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlOyc7XG4gICAgICBxckh0bWwgKz0gJyBwYWRkaW5nOiAwcHg7IG1hcmdpbjogJyArIG1hcmdpbiArICdweDsnO1xuICAgICAgcXJIdG1sICs9ICdcIj4nO1xuICAgICAgcXJIdG1sICs9ICc8dGJvZHk+JztcblxuICAgICAgZm9yICh2YXIgciA9IDA7IHIgPCBfdGhpcy5nZXRNb2R1bGVDb3VudCgpOyByICs9IDEpIHtcblxuICAgICAgICBxckh0bWwgKz0gJzx0cj4nO1xuXG4gICAgICAgIGZvciAodmFyIGMgPSAwOyBjIDwgX3RoaXMuZ2V0TW9kdWxlQ291bnQoKTsgYyArPSAxKSB7XG4gICAgICAgICAgcXJIdG1sICs9ICc8dGQgc3R5bGU9XCInO1xuICAgICAgICAgIHFySHRtbCArPSAnIGJvcmRlci13aWR0aDogMHB4OyBib3JkZXItc3R5bGU6IG5vbmU7JztcbiAgICAgICAgICBxckh0bWwgKz0gJyBib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlOyc7XG4gICAgICAgICAgcXJIdG1sICs9ICcgcGFkZGluZzogMHB4OyBtYXJnaW46IDBweDsnO1xuICAgICAgICAgIHFySHRtbCArPSAnIHdpZHRoOiAnICsgY2VsbFNpemUgKyAncHg7JztcbiAgICAgICAgICBxckh0bWwgKz0gJyBoZWlnaHQ6ICcgKyBjZWxsU2l6ZSArICdweDsnO1xuICAgICAgICAgIHFySHRtbCArPSAnIGJhY2tncm91bmQtY29sb3I6ICc7XG4gICAgICAgICAgcXJIdG1sICs9IF90aGlzLmlzRGFyayhyLCBjKT8gJyMwMDAwMDAnIDogJyNmZmZmZmYnO1xuICAgICAgICAgIHFySHRtbCArPSAnOyc7XG4gICAgICAgICAgcXJIdG1sICs9ICdcIi8+JztcbiAgICAgICAgfVxuXG4gICAgICAgIHFySHRtbCArPSAnPC90cj4nO1xuICAgICAgfVxuXG4gICAgICBxckh0bWwgKz0gJzwvdGJvZHk+JztcbiAgICAgIHFySHRtbCArPSAnPC90YWJsZT4nO1xuXG4gICAgICByZXR1cm4gcXJIdG1sO1xuICAgIH07XG5cbiAgICBfdGhpcy5jcmVhdGVTdmdUYWcgPSBmdW5jdGlvbihjZWxsU2l6ZSwgbWFyZ2luLCBhbHQsIHRpdGxlKSB7XG5cbiAgICAgIHZhciBvcHRzID0ge307XG4gICAgICBpZiAodHlwZW9mIGFyZ3VtZW50c1swXSA9PSAnb2JqZWN0Jykge1xuICAgICAgICAvLyBDYWxsZWQgYnkgb3B0aW9ucy5cbiAgICAgICAgb3B0cyA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgLy8gb3ZlcndyaXRlIGNlbGxTaXplIGFuZCBtYXJnaW4uXG4gICAgICAgIGNlbGxTaXplID0gb3B0cy5jZWxsU2l6ZTtcbiAgICAgICAgbWFyZ2luID0gb3B0cy5tYXJnaW47XG4gICAgICAgIGFsdCA9IG9wdHMuYWx0O1xuICAgICAgICB0aXRsZSA9IG9wdHMudGl0bGU7XG4gICAgICB9XG5cbiAgICAgIGNlbGxTaXplID0gY2VsbFNpemUgfHwgMjtcbiAgICAgIG1hcmdpbiA9ICh0eXBlb2YgbWFyZ2luID09ICd1bmRlZmluZWQnKT8gY2VsbFNpemUgKiA0IDogbWFyZ2luO1xuXG4gICAgICAvLyBDb21wb3NlIGFsdCBwcm9wZXJ0eSBzdXJyb2dhdGVcbiAgICAgIGFsdCA9ICh0eXBlb2YgYWx0ID09PSAnc3RyaW5nJykgPyB7dGV4dDogYWx0fSA6IGFsdCB8fCB7fTtcbiAgICAgIGFsdC50ZXh0ID0gYWx0LnRleHQgfHwgbnVsbDtcbiAgICAgIGFsdC5pZCA9IChhbHQudGV4dCkgPyBhbHQuaWQgfHwgJ3FyY29kZS1kZXNjcmlwdGlvbicgOiBudWxsO1xuXG4gICAgICAvLyBDb21wb3NlIHRpdGxlIHByb3BlcnR5IHN1cnJvZ2F0ZVxuICAgICAgdGl0bGUgPSAodHlwZW9mIHRpdGxlID09PSAnc3RyaW5nJykgPyB7dGV4dDogdGl0bGV9IDogdGl0bGUgfHwge307XG4gICAgICB0aXRsZS50ZXh0ID0gdGl0bGUudGV4dCB8fCBudWxsO1xuICAgICAgdGl0bGUuaWQgPSAodGl0bGUudGV4dCkgPyB0aXRsZS5pZCB8fCAncXJjb2RlLXRpdGxlJyA6IG51bGw7XG5cbiAgICAgIHZhciBzaXplID0gX3RoaXMuZ2V0TW9kdWxlQ291bnQoKSAqIGNlbGxTaXplICsgbWFyZ2luICogMjtcbiAgICAgIHZhciBjLCBtYywgciwgbXIsIHFyU3ZnPScnLCByZWN0O1xuXG4gICAgICByZWN0ID0gJ2wnICsgY2VsbFNpemUgKyAnLDAgMCwnICsgY2VsbFNpemUgK1xuICAgICAgICAnIC0nICsgY2VsbFNpemUgKyAnLDAgMCwtJyArIGNlbGxTaXplICsgJ3ogJztcblxuICAgICAgcXJTdmcgKz0gJzxzdmcgdmVyc2lvbj1cIjEuMVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIic7XG4gICAgICBxclN2ZyArPSAhb3B0cy5zY2FsYWJsZSA/ICcgd2lkdGg9XCInICsgc2l6ZSArICdweFwiIGhlaWdodD1cIicgKyBzaXplICsgJ3B4XCInIDogJyc7XG4gICAgICBxclN2ZyArPSAnIHZpZXdCb3g9XCIwIDAgJyArIHNpemUgKyAnICcgKyBzaXplICsgJ1wiICc7XG4gICAgICBxclN2ZyArPSAnIHByZXNlcnZlQXNwZWN0UmF0aW89XCJ4TWluWU1pbiBtZWV0XCInO1xuICAgICAgcXJTdmcgKz0gKHRpdGxlLnRleHQgfHwgYWx0LnRleHQpID8gJyByb2xlPVwiaW1nXCIgYXJpYS1sYWJlbGxlZGJ5PVwiJyArXG4gICAgICAgICAgZXNjYXBlWG1sKFt0aXRsZS5pZCwgYWx0LmlkXS5qb2luKCcgJykudHJpbSgpICkgKyAnXCInIDogJyc7XG4gICAgICBxclN2ZyArPSAnPic7XG4gICAgICBxclN2ZyArPSAodGl0bGUudGV4dCkgPyAnPHRpdGxlIGlkPVwiJyArIGVzY2FwZVhtbCh0aXRsZS5pZCkgKyAnXCI+JyArXG4gICAgICAgICAgZXNjYXBlWG1sKHRpdGxlLnRleHQpICsgJzwvdGl0bGU+JyA6ICcnO1xuICAgICAgcXJTdmcgKz0gKGFsdC50ZXh0KSA/ICc8ZGVzY3JpcHRpb24gaWQ9XCInICsgZXNjYXBlWG1sKGFsdC5pZCkgKyAnXCI+JyArXG4gICAgICAgICAgZXNjYXBlWG1sKGFsdC50ZXh0KSArICc8L2Rlc2NyaXB0aW9uPicgOiAnJztcbiAgICAgIHFyU3ZnICs9ICc8cmVjdCB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCIgZmlsbD1cIndoaXRlXCIgY3g9XCIwXCIgY3k9XCIwXCIvPic7XG4gICAgICBxclN2ZyArPSAnPHBhdGggZD1cIic7XG5cbiAgICAgIGZvciAociA9IDA7IHIgPCBfdGhpcy5nZXRNb2R1bGVDb3VudCgpOyByICs9IDEpIHtcbiAgICAgICAgbXIgPSByICogY2VsbFNpemUgKyBtYXJnaW47XG4gICAgICAgIGZvciAoYyA9IDA7IGMgPCBfdGhpcy5nZXRNb2R1bGVDb3VudCgpOyBjICs9IDEpIHtcbiAgICAgICAgICBpZiAoX3RoaXMuaXNEYXJrKHIsIGMpICkge1xuICAgICAgICAgICAgbWMgPSBjKmNlbGxTaXplK21hcmdpbjtcbiAgICAgICAgICAgIHFyU3ZnICs9ICdNJyArIG1jICsgJywnICsgbXIgKyByZWN0O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBxclN2ZyArPSAnXCIgc3Ryb2tlPVwidHJhbnNwYXJlbnRcIiBmaWxsPVwiYmxhY2tcIi8+JztcbiAgICAgIHFyU3ZnICs9ICc8L3N2Zz4nO1xuXG4gICAgICByZXR1cm4gcXJTdmc7XG4gICAgfTtcblxuICAgIF90aGlzLmNyZWF0ZURhdGFVUkwgPSBmdW5jdGlvbihjZWxsU2l6ZSwgbWFyZ2luKSB7XG5cbiAgICAgIGNlbGxTaXplID0gY2VsbFNpemUgfHwgMjtcbiAgICAgIG1hcmdpbiA9ICh0eXBlb2YgbWFyZ2luID09ICd1bmRlZmluZWQnKT8gY2VsbFNpemUgKiA0IDogbWFyZ2luO1xuXG4gICAgICB2YXIgc2l6ZSA9IF90aGlzLmdldE1vZHVsZUNvdW50KCkgKiBjZWxsU2l6ZSArIG1hcmdpbiAqIDI7XG4gICAgICB2YXIgbWluID0gbWFyZ2luO1xuICAgICAgdmFyIG1heCA9IHNpemUgLSBtYXJnaW47XG5cbiAgICAgIHJldHVybiBjcmVhdGVEYXRhVVJMKHNpemUsIHNpemUsIGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgaWYgKG1pbiA8PSB4ICYmIHggPCBtYXggJiYgbWluIDw9IHkgJiYgeSA8IG1heCkge1xuICAgICAgICAgIHZhciBjID0gTWF0aC5mbG9vciggKHggLSBtaW4pIC8gY2VsbFNpemUpO1xuICAgICAgICAgIHZhciByID0gTWF0aC5mbG9vciggKHkgLSBtaW4pIC8gY2VsbFNpemUpO1xuICAgICAgICAgIHJldHVybiBfdGhpcy5pc0RhcmsociwgYyk/IDAgOiAxO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9XG4gICAgICB9ICk7XG4gICAgfTtcblxuICAgIF90aGlzLmNyZWF0ZUltZ1RhZyA9IGZ1bmN0aW9uKGNlbGxTaXplLCBtYXJnaW4sIGFsdCkge1xuXG4gICAgICBjZWxsU2l6ZSA9IGNlbGxTaXplIHx8IDI7XG4gICAgICBtYXJnaW4gPSAodHlwZW9mIG1hcmdpbiA9PSAndW5kZWZpbmVkJyk/IGNlbGxTaXplICogNCA6IG1hcmdpbjtcblxuICAgICAgdmFyIHNpemUgPSBfdGhpcy5nZXRNb2R1bGVDb3VudCgpICogY2VsbFNpemUgKyBtYXJnaW4gKiAyO1xuXG4gICAgICB2YXIgaW1nID0gJyc7XG4gICAgICBpbWcgKz0gJzxpbWcnO1xuICAgICAgaW1nICs9ICdcXHUwMDIwc3JjPVwiJztcbiAgICAgIGltZyArPSBfdGhpcy5jcmVhdGVEYXRhVVJMKGNlbGxTaXplLCBtYXJnaW4pO1xuICAgICAgaW1nICs9ICdcIic7XG4gICAgICBpbWcgKz0gJ1xcdTAwMjB3aWR0aD1cIic7XG4gICAgICBpbWcgKz0gc2l6ZTtcbiAgICAgIGltZyArPSAnXCInO1xuICAgICAgaW1nICs9ICdcXHUwMDIwaGVpZ2h0PVwiJztcbiAgICAgIGltZyArPSBzaXplO1xuICAgICAgaW1nICs9ICdcIic7XG4gICAgICBpZiAoYWx0KSB7XG4gICAgICAgIGltZyArPSAnXFx1MDAyMGFsdD1cIic7XG4gICAgICAgIGltZyArPSBlc2NhcGVYbWwoYWx0KTtcbiAgICAgICAgaW1nICs9ICdcIic7XG4gICAgICB9XG4gICAgICBpbWcgKz0gJy8+JztcblxuICAgICAgcmV0dXJuIGltZztcbiAgICB9O1xuXG4gICAgdmFyIGVzY2FwZVhtbCA9IGZ1bmN0aW9uKHMpIHtcbiAgICAgIHZhciBlc2NhcGVkID0gJyc7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgdmFyIGMgPSBzLmNoYXJBdChpKTtcbiAgICAgICAgc3dpdGNoKGMpIHtcbiAgICAgICAgY2FzZSAnPCc6IGVzY2FwZWQgKz0gJyZsdDsnOyBicmVhaztcbiAgICAgICAgY2FzZSAnPic6IGVzY2FwZWQgKz0gJyZndDsnOyBicmVhaztcbiAgICAgICAgY2FzZSAnJic6IGVzY2FwZWQgKz0gJyZhbXA7JzsgYnJlYWs7XG4gICAgICAgIGNhc2UgJ1wiJzogZXNjYXBlZCArPSAnJnF1b3Q7JzsgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQgOiBlc2NhcGVkICs9IGM7IGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZXNjYXBlZDtcbiAgICB9O1xuXG4gICAgdmFyIF9jcmVhdGVIYWxmQVNDSUkgPSBmdW5jdGlvbihtYXJnaW4pIHtcbiAgICAgIHZhciBjZWxsU2l6ZSA9IDE7XG4gICAgICBtYXJnaW4gPSAodHlwZW9mIG1hcmdpbiA9PSAndW5kZWZpbmVkJyk/IGNlbGxTaXplICogMiA6IG1hcmdpbjtcblxuICAgICAgdmFyIHNpemUgPSBfdGhpcy5nZXRNb2R1bGVDb3VudCgpICogY2VsbFNpemUgKyBtYXJnaW4gKiAyO1xuICAgICAgdmFyIG1pbiA9IG1hcmdpbjtcbiAgICAgIHZhciBtYXggPSBzaXplIC0gbWFyZ2luO1xuXG4gICAgICB2YXIgeSwgeCwgcjEsIHIyLCBwO1xuXG4gICAgICB2YXIgYmxvY2tzID0ge1xuICAgICAgICAn4paI4paIJzogJ+KWiCcsXG4gICAgICAgICfiloggJzogJ+KWgCcsXG4gICAgICAgICcg4paIJzogJ+KWhCcsXG4gICAgICAgICcgICc6ICcgJ1xuICAgICAgfTtcblxuICAgICAgdmFyIGJsb2Nrc0xhc3RMaW5lTm9NYXJnaW4gPSB7XG4gICAgICAgICfilojilognOiAn4paAJyxcbiAgICAgICAgJ+KWiCAnOiAn4paAJyxcbiAgICAgICAgJyDilognOiAnICcsXG4gICAgICAgICcgICc6ICcgJ1xuICAgICAgfTtcblxuICAgICAgdmFyIGFzY2lpID0gJyc7XG4gICAgICBmb3IgKHkgPSAwOyB5IDwgc2l6ZTsgeSArPSAyKSB7XG4gICAgICAgIHIxID0gTWF0aC5mbG9vcigoeSAtIG1pbikgLyBjZWxsU2l6ZSk7XG4gICAgICAgIHIyID0gTWF0aC5mbG9vcigoeSArIDEgLSBtaW4pIC8gY2VsbFNpemUpO1xuICAgICAgICBmb3IgKHggPSAwOyB4IDwgc2l6ZTsgeCArPSAxKSB7XG4gICAgICAgICAgcCA9ICfilognO1xuXG4gICAgICAgICAgaWYgKG1pbiA8PSB4ICYmIHggPCBtYXggJiYgbWluIDw9IHkgJiYgeSA8IG1heCAmJiBfdGhpcy5pc0RhcmsocjEsIE1hdGguZmxvb3IoKHggLSBtaW4pIC8gY2VsbFNpemUpKSkge1xuICAgICAgICAgICAgcCA9ICcgJztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAobWluIDw9IHggJiYgeCA8IG1heCAmJiBtaW4gPD0geSsxICYmIHkrMSA8IG1heCAmJiBfdGhpcy5pc0RhcmsocjIsIE1hdGguZmxvb3IoKHggLSBtaW4pIC8gY2VsbFNpemUpKSkge1xuICAgICAgICAgICAgcCArPSAnICc7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcCArPSAn4paIJztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBPdXRwdXQgMiBjaGFyYWN0ZXJzIHBlciBwaXhlbCwgdG8gY3JlYXRlIGZ1bGwgc3F1YXJlLiAxIGNoYXJhY3RlciBwZXIgcGl4ZWxzIGdpdmVzIG9ubHkgaGFsZiB3aWR0aCBvZiBzcXVhcmUuXG4gICAgICAgICAgYXNjaWkgKz0gKG1hcmdpbiA8IDEgJiYgeSsxID49IG1heCkgPyBibG9ja3NMYXN0TGluZU5vTWFyZ2luW3BdIDogYmxvY2tzW3BdO1xuICAgICAgICB9XG5cbiAgICAgICAgYXNjaWkgKz0gJ1xcbic7XG4gICAgICB9XG5cbiAgICAgIGlmIChzaXplICUgMiAmJiBtYXJnaW4gPiAwKSB7XG4gICAgICAgIHJldHVybiBhc2NpaS5zdWJzdHJpbmcoMCwgYXNjaWkubGVuZ3RoIC0gc2l6ZSAtIDEpICsgQXJyYXkoc2l6ZSsxKS5qb2luKCfiloAnKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGFzY2lpLnN1YnN0cmluZygwLCBhc2NpaS5sZW5ndGgtMSk7XG4gICAgfTtcblxuICAgIF90aGlzLmNyZWF0ZUFTQ0lJID0gZnVuY3Rpb24oY2VsbFNpemUsIG1hcmdpbikge1xuICAgICAgY2VsbFNpemUgPSBjZWxsU2l6ZSB8fCAxO1xuXG4gICAgICBpZiAoY2VsbFNpemUgPCAyKSB7XG4gICAgICAgIHJldHVybiBfY3JlYXRlSGFsZkFTQ0lJKG1hcmdpbik7XG4gICAgICB9XG5cbiAgICAgIGNlbGxTaXplIC09IDE7XG4gICAgICBtYXJnaW4gPSAodHlwZW9mIG1hcmdpbiA9PSAndW5kZWZpbmVkJyk/IGNlbGxTaXplICogMiA6IG1hcmdpbjtcblxuICAgICAgdmFyIHNpemUgPSBfdGhpcy5nZXRNb2R1bGVDb3VudCgpICogY2VsbFNpemUgKyBtYXJnaW4gKiAyO1xuICAgICAgdmFyIG1pbiA9IG1hcmdpbjtcbiAgICAgIHZhciBtYXggPSBzaXplIC0gbWFyZ2luO1xuXG4gICAgICB2YXIgeSwgeCwgciwgcDtcblxuICAgICAgdmFyIHdoaXRlID0gQXJyYXkoY2VsbFNpemUrMSkuam9pbign4paI4paIJyk7XG4gICAgICB2YXIgYmxhY2sgPSBBcnJheShjZWxsU2l6ZSsxKS5qb2luKCcgICcpO1xuXG4gICAgICB2YXIgYXNjaWkgPSAnJztcbiAgICAgIHZhciBsaW5lID0gJyc7XG4gICAgICBmb3IgKHkgPSAwOyB5IDwgc2l6ZTsgeSArPSAxKSB7XG4gICAgICAgIHIgPSBNYXRoLmZsb29yKCAoeSAtIG1pbikgLyBjZWxsU2l6ZSk7XG4gICAgICAgIGxpbmUgPSAnJztcbiAgICAgICAgZm9yICh4ID0gMDsgeCA8IHNpemU7IHggKz0gMSkge1xuICAgICAgICAgIHAgPSAxO1xuXG4gICAgICAgICAgaWYgKG1pbiA8PSB4ICYmIHggPCBtYXggJiYgbWluIDw9IHkgJiYgeSA8IG1heCAmJiBfdGhpcy5pc0RhcmsociwgTWF0aC5mbG9vcigoeCAtIG1pbikgLyBjZWxsU2l6ZSkpKSB7XG4gICAgICAgICAgICBwID0gMDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBPdXRwdXQgMiBjaGFyYWN0ZXJzIHBlciBwaXhlbCwgdG8gY3JlYXRlIGZ1bGwgc3F1YXJlLiAxIGNoYXJhY3RlciBwZXIgcGl4ZWxzIGdpdmVzIG9ubHkgaGFsZiB3aWR0aCBvZiBzcXVhcmUuXG4gICAgICAgICAgbGluZSArPSBwID8gd2hpdGUgOiBibGFjaztcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAociA9IDA7IHIgPCBjZWxsU2l6ZTsgciArPSAxKSB7XG4gICAgICAgICAgYXNjaWkgKz0gbGluZSArICdcXG4nO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBhc2NpaS5zdWJzdHJpbmcoMCwgYXNjaWkubGVuZ3RoLTEpO1xuICAgIH07XG5cbiAgICBfdGhpcy5yZW5kZXJUbzJkQ29udGV4dCA9IGZ1bmN0aW9uKGNvbnRleHQsIGNlbGxTaXplKSB7XG4gICAgICBjZWxsU2l6ZSA9IGNlbGxTaXplIHx8IDI7XG4gICAgICB2YXIgbGVuZ3RoID0gX3RoaXMuZ2V0TW9kdWxlQ291bnQoKTtcbiAgICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IGxlbmd0aDsgcm93KyspIHtcbiAgICAgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgbGVuZ3RoOyBjb2wrKykge1xuICAgICAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gX3RoaXMuaXNEYXJrKHJvdywgY29sKSA/ICdibGFjaycgOiAnd2hpdGUnO1xuICAgICAgICAgIGNvbnRleHQuZmlsbFJlY3Qocm93ICogY2VsbFNpemUsIGNvbCAqIGNlbGxTaXplLCBjZWxsU2l6ZSwgY2VsbFNpemUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIF90aGlzO1xuICB9O1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIHFyY29kZS5zdHJpbmdUb0J5dGVzXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgcXJjb2RlLnN0cmluZ1RvQnl0ZXNGdW5jcyA9IHtcbiAgICAnZGVmYXVsdCcgOiBmdW5jdGlvbihzKSB7XG4gICAgICB2YXIgYnl0ZXMgPSBbXTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB2YXIgYyA9IHMuY2hhckNvZGVBdChpKTtcbiAgICAgICAgYnl0ZXMucHVzaChjICYgMHhmZik7XG4gICAgICB9XG4gICAgICByZXR1cm4gYnl0ZXM7XG4gICAgfVxuICB9O1xuXG4gIHFyY29kZS5zdHJpbmdUb0J5dGVzID0gcXJjb2RlLnN0cmluZ1RvQnl0ZXNGdW5jc1snZGVmYXVsdCddO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIHFyY29kZS5jcmVhdGVTdHJpbmdUb0J5dGVzXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLyoqXG4gICAqIEBwYXJhbSB1bmljb2RlRGF0YSBiYXNlNjQgc3RyaW5nIG9mIGJ5dGUgYXJyYXkuXG4gICAqIFsxNmJpdCBVbmljb2RlXSxbMTZiaXQgQnl0ZXNdLCAuLi5cbiAgICogQHBhcmFtIG51bUNoYXJzXG4gICAqL1xuICBxcmNvZGUuY3JlYXRlU3RyaW5nVG9CeXRlcyA9IGZ1bmN0aW9uKHVuaWNvZGVEYXRhLCBudW1DaGFycykge1xuXG4gICAgLy8gY3JlYXRlIGNvbnZlcnNpb24gbWFwLlxuXG4gICAgdmFyIHVuaWNvZGVNYXAgPSBmdW5jdGlvbigpIHtcblxuICAgICAgdmFyIGJpbiA9IGJhc2U2NERlY29kZUlucHV0U3RyZWFtKHVuaWNvZGVEYXRhKTtcbiAgICAgIHZhciByZWFkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBiID0gYmluLnJlYWQoKTtcbiAgICAgICAgaWYgKGIgPT0gLTEpIHRocm93ICdlb2YnO1xuICAgICAgICByZXR1cm4gYjtcbiAgICAgIH07XG5cbiAgICAgIHZhciBjb3VudCA9IDA7XG4gICAgICB2YXIgdW5pY29kZU1hcCA9IHt9O1xuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgdmFyIGIwID0gYmluLnJlYWQoKTtcbiAgICAgICAgaWYgKGIwID09IC0xKSBicmVhaztcbiAgICAgICAgdmFyIGIxID0gcmVhZCgpO1xuICAgICAgICB2YXIgYjIgPSByZWFkKCk7XG4gICAgICAgIHZhciBiMyA9IHJlYWQoKTtcbiAgICAgICAgdmFyIGsgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKCAoYjAgPDwgOCkgfCBiMSk7XG4gICAgICAgIHZhciB2ID0gKGIyIDw8IDgpIHwgYjM7XG4gICAgICAgIHVuaWNvZGVNYXBba10gPSB2O1xuICAgICAgICBjb3VudCArPSAxO1xuICAgICAgfVxuICAgICAgaWYgKGNvdW50ICE9IG51bUNoYXJzKSB7XG4gICAgICAgIHRocm93IGNvdW50ICsgJyAhPSAnICsgbnVtQ2hhcnM7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB1bmljb2RlTWFwO1xuICAgIH0oKTtcblxuICAgIHZhciB1bmtub3duQ2hhciA9ICc/Jy5jaGFyQ29kZUF0KDApO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKHMpIHtcbiAgICAgIHZhciBieXRlcyA9IFtdO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHZhciBjID0gcy5jaGFyQ29kZUF0KGkpO1xuICAgICAgICBpZiAoYyA8IDEyOCkge1xuICAgICAgICAgIGJ5dGVzLnB1c2goYyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIGIgPSB1bmljb2RlTWFwW3MuY2hhckF0KGkpXTtcbiAgICAgICAgICBpZiAodHlwZW9mIGIgPT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIGlmICggKGIgJiAweGZmKSA9PSBiKSB7XG4gICAgICAgICAgICAgIC8vIDFieXRlXG4gICAgICAgICAgICAgIGJ5dGVzLnB1c2goYik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyAyYnl0ZXNcbiAgICAgICAgICAgICAgYnl0ZXMucHVzaChiID4+PiA4KTtcbiAgICAgICAgICAgICAgYnl0ZXMucHVzaChiICYgMHhmZik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJ5dGVzLnB1c2godW5rbm93bkNoYXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGJ5dGVzO1xuICAgIH07XG4gIH07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gUVJNb2RlXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIFFSTW9kZSA9IHtcbiAgICBNT0RFX05VTUJFUiA6ICAgIDEgPDwgMCxcbiAgICBNT0RFX0FMUEhBX05VTSA6IDEgPDwgMSxcbiAgICBNT0RFXzhCSVRfQllURSA6IDEgPDwgMixcbiAgICBNT0RFX0tBTkpJIDogICAgIDEgPDwgM1xuICB9O1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIFFSRXJyb3JDb3JyZWN0aW9uTGV2ZWxcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICB2YXIgUVJFcnJvckNvcnJlY3Rpb25MZXZlbCA9IHtcbiAgICBMIDogMSxcbiAgICBNIDogMCxcbiAgICBRIDogMyxcbiAgICBIIDogMlxuICB9O1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIFFSTWFza1BhdHRlcm5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICB2YXIgUVJNYXNrUGF0dGVybiA9IHtcbiAgICBQQVRURVJOMDAwIDogMCxcbiAgICBQQVRURVJOMDAxIDogMSxcbiAgICBQQVRURVJOMDEwIDogMixcbiAgICBQQVRURVJOMDExIDogMyxcbiAgICBQQVRURVJOMTAwIDogNCxcbiAgICBQQVRURVJOMTAxIDogNSxcbiAgICBQQVRURVJOMTEwIDogNixcbiAgICBQQVRURVJOMTExIDogN1xuICB9O1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIFFSVXRpbFxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHZhciBRUlV0aWwgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBQQVRURVJOX1BPU0lUSU9OX1RBQkxFID0gW1xuICAgICAgW10sXG4gICAgICBbNiwgMThdLFxuICAgICAgWzYsIDIyXSxcbiAgICAgIFs2LCAyNl0sXG4gICAgICBbNiwgMzBdLFxuICAgICAgWzYsIDM0XSxcbiAgICAgIFs2LCAyMiwgMzhdLFxuICAgICAgWzYsIDI0LCA0Ml0sXG4gICAgICBbNiwgMjYsIDQ2XSxcbiAgICAgIFs2LCAyOCwgNTBdLFxuICAgICAgWzYsIDMwLCA1NF0sXG4gICAgICBbNiwgMzIsIDU4XSxcbiAgICAgIFs2LCAzNCwgNjJdLFxuICAgICAgWzYsIDI2LCA0NiwgNjZdLFxuICAgICAgWzYsIDI2LCA0OCwgNzBdLFxuICAgICAgWzYsIDI2LCA1MCwgNzRdLFxuICAgICAgWzYsIDMwLCA1NCwgNzhdLFxuICAgICAgWzYsIDMwLCA1NiwgODJdLFxuICAgICAgWzYsIDMwLCA1OCwgODZdLFxuICAgICAgWzYsIDM0LCA2MiwgOTBdLFxuICAgICAgWzYsIDI4LCA1MCwgNzIsIDk0XSxcbiAgICAgIFs2LCAyNiwgNTAsIDc0LCA5OF0sXG4gICAgICBbNiwgMzAsIDU0LCA3OCwgMTAyXSxcbiAgICAgIFs2LCAyOCwgNTQsIDgwLCAxMDZdLFxuICAgICAgWzYsIDMyLCA1OCwgODQsIDExMF0sXG4gICAgICBbNiwgMzAsIDU4LCA4NiwgMTE0XSxcbiAgICAgIFs2LCAzNCwgNjIsIDkwLCAxMThdLFxuICAgICAgWzYsIDI2LCA1MCwgNzQsIDk4LCAxMjJdLFxuICAgICAgWzYsIDMwLCA1NCwgNzgsIDEwMiwgMTI2XSxcbiAgICAgIFs2LCAyNiwgNTIsIDc4LCAxMDQsIDEzMF0sXG4gICAgICBbNiwgMzAsIDU2LCA4MiwgMTA4LCAxMzRdLFxuICAgICAgWzYsIDM0LCA2MCwgODYsIDExMiwgMTM4XSxcbiAgICAgIFs2LCAzMCwgNTgsIDg2LCAxMTQsIDE0Ml0sXG4gICAgICBbNiwgMzQsIDYyLCA5MCwgMTE4LCAxNDZdLFxuICAgICAgWzYsIDMwLCA1NCwgNzgsIDEwMiwgMTI2LCAxNTBdLFxuICAgICAgWzYsIDI0LCA1MCwgNzYsIDEwMiwgMTI4LCAxNTRdLFxuICAgICAgWzYsIDI4LCA1NCwgODAsIDEwNiwgMTMyLCAxNThdLFxuICAgICAgWzYsIDMyLCA1OCwgODQsIDExMCwgMTM2LCAxNjJdLFxuICAgICAgWzYsIDI2LCA1NCwgODIsIDExMCwgMTM4LCAxNjZdLFxuICAgICAgWzYsIDMwLCA1OCwgODYsIDExNCwgMTQyLCAxNzBdXG4gICAgXTtcbiAgICB2YXIgRzE1ID0gKDEgPDwgMTApIHwgKDEgPDwgOCkgfCAoMSA8PCA1KSB8ICgxIDw8IDQpIHwgKDEgPDwgMikgfCAoMSA8PCAxKSB8ICgxIDw8IDApO1xuICAgIHZhciBHMTggPSAoMSA8PCAxMikgfCAoMSA8PCAxMSkgfCAoMSA8PCAxMCkgfCAoMSA8PCA5KSB8ICgxIDw8IDgpIHwgKDEgPDwgNSkgfCAoMSA8PCAyKSB8ICgxIDw8IDApO1xuICAgIHZhciBHMTVfTUFTSyA9ICgxIDw8IDE0KSB8ICgxIDw8IDEyKSB8ICgxIDw8IDEwKSB8ICgxIDw8IDQpIHwgKDEgPDwgMSk7XG5cbiAgICB2YXIgX3RoaXMgPSB7fTtcblxuICAgIHZhciBnZXRCQ0hEaWdpdCA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHZhciBkaWdpdCA9IDA7XG4gICAgICB3aGlsZSAoZGF0YSAhPSAwKSB7XG4gICAgICAgIGRpZ2l0ICs9IDE7XG4gICAgICAgIGRhdGEgPj4+PSAxO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGRpZ2l0O1xuICAgIH07XG5cbiAgICBfdGhpcy5nZXRCQ0hUeXBlSW5mbyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHZhciBkID0gZGF0YSA8PCAxMDtcbiAgICAgIHdoaWxlIChnZXRCQ0hEaWdpdChkKSAtIGdldEJDSERpZ2l0KEcxNSkgPj0gMCkge1xuICAgICAgICBkIF49IChHMTUgPDwgKGdldEJDSERpZ2l0KGQpIC0gZ2V0QkNIRGlnaXQoRzE1KSApICk7XG4gICAgICB9XG4gICAgICByZXR1cm4gKCAoZGF0YSA8PCAxMCkgfCBkKSBeIEcxNV9NQVNLO1xuICAgIH07XG5cbiAgICBfdGhpcy5nZXRCQ0hUeXBlTnVtYmVyID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdmFyIGQgPSBkYXRhIDw8IDEyO1xuICAgICAgd2hpbGUgKGdldEJDSERpZ2l0KGQpIC0gZ2V0QkNIRGlnaXQoRzE4KSA+PSAwKSB7XG4gICAgICAgIGQgXj0gKEcxOCA8PCAoZ2V0QkNIRGlnaXQoZCkgLSBnZXRCQ0hEaWdpdChHMTgpICkgKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiAoZGF0YSA8PCAxMikgfCBkO1xuICAgIH07XG5cbiAgICBfdGhpcy5nZXRQYXR0ZXJuUG9zaXRpb24gPSBmdW5jdGlvbih0eXBlTnVtYmVyKSB7XG4gICAgICByZXR1cm4gUEFUVEVSTl9QT1NJVElPTl9UQUJMRVt0eXBlTnVtYmVyIC0gMV07XG4gICAgfTtcblxuICAgIF90aGlzLmdldE1hc2tGdW5jdGlvbiA9IGZ1bmN0aW9uKG1hc2tQYXR0ZXJuKSB7XG5cbiAgICAgIHN3aXRjaCAobWFza1BhdHRlcm4pIHtcblxuICAgICAgY2FzZSBRUk1hc2tQYXR0ZXJuLlBBVFRFUk4wMDAgOlxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaSwgaikgeyByZXR1cm4gKGkgKyBqKSAlIDIgPT0gMDsgfTtcbiAgICAgIGNhc2UgUVJNYXNrUGF0dGVybi5QQVRURVJOMDAxIDpcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGksIGopIHsgcmV0dXJuIGkgJSAyID09IDA7IH07XG4gICAgICBjYXNlIFFSTWFza1BhdHRlcm4uUEFUVEVSTjAxMCA6XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpLCBqKSB7IHJldHVybiBqICUgMyA9PSAwOyB9O1xuICAgICAgY2FzZSBRUk1hc2tQYXR0ZXJuLlBBVFRFUk4wMTEgOlxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaSwgaikgeyByZXR1cm4gKGkgKyBqKSAlIDMgPT0gMDsgfTtcbiAgICAgIGNhc2UgUVJNYXNrUGF0dGVybi5QQVRURVJOMTAwIDpcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGksIGopIHsgcmV0dXJuIChNYXRoLmZsb29yKGkgLyAyKSArIE1hdGguZmxvb3IoaiAvIDMpICkgJSAyID09IDA7IH07XG4gICAgICBjYXNlIFFSTWFza1BhdHRlcm4uUEFUVEVSTjEwMSA6XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpLCBqKSB7IHJldHVybiAoaSAqIGopICUgMiArIChpICogaikgJSAzID09IDA7IH07XG4gICAgICBjYXNlIFFSTWFza1BhdHRlcm4uUEFUVEVSTjExMCA6XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpLCBqKSB7IHJldHVybiAoIChpICogaikgJSAyICsgKGkgKiBqKSAlIDMpICUgMiA9PSAwOyB9O1xuICAgICAgY2FzZSBRUk1hc2tQYXR0ZXJuLlBBVFRFUk4xMTEgOlxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaSwgaikgeyByZXR1cm4gKCAoaSAqIGopICUgMyArIChpICsgaikgJSAyKSAlIDIgPT0gMDsgfTtcblxuICAgICAgZGVmYXVsdCA6XG4gICAgICAgIHRocm93ICdiYWQgbWFza1BhdHRlcm46JyArIG1hc2tQYXR0ZXJuO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBfdGhpcy5nZXRFcnJvckNvcnJlY3RQb2x5bm9taWFsID0gZnVuY3Rpb24oZXJyb3JDb3JyZWN0TGVuZ3RoKSB7XG4gICAgICB2YXIgYSA9IHFyUG9seW5vbWlhbChbMV0sIDApO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlcnJvckNvcnJlY3RMZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBhID0gYS5tdWx0aXBseShxclBvbHlub21pYWwoWzEsIFFSTWF0aC5nZXhwKGkpXSwgMCkgKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhO1xuICAgIH07XG5cbiAgICBfdGhpcy5nZXRMZW5ndGhJbkJpdHMgPSBmdW5jdGlvbihtb2RlLCB0eXBlKSB7XG5cbiAgICAgIGlmICgxIDw9IHR5cGUgJiYgdHlwZSA8IDEwKSB7XG5cbiAgICAgICAgLy8gMSAtIDlcblxuICAgICAgICBzd2l0Y2gobW9kZSkge1xuICAgICAgICBjYXNlIFFSTW9kZS5NT0RFX05VTUJFUiAgICA6IHJldHVybiAxMDtcbiAgICAgICAgY2FzZSBRUk1vZGUuTU9ERV9BTFBIQV9OVU0gOiByZXR1cm4gOTtcbiAgICAgICAgY2FzZSBRUk1vZGUuTU9ERV84QklUX0JZVEUgOiByZXR1cm4gODtcbiAgICAgICAgY2FzZSBRUk1vZGUuTU9ERV9LQU5KSSAgICAgOiByZXR1cm4gODtcbiAgICAgICAgZGVmYXVsdCA6XG4gICAgICAgICAgdGhyb3cgJ21vZGU6JyArIG1vZGU7XG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIGlmICh0eXBlIDwgMjcpIHtcblxuICAgICAgICAvLyAxMCAtIDI2XG5cbiAgICAgICAgc3dpdGNoKG1vZGUpIHtcbiAgICAgICAgY2FzZSBRUk1vZGUuTU9ERV9OVU1CRVIgICAgOiByZXR1cm4gMTI7XG4gICAgICAgIGNhc2UgUVJNb2RlLk1PREVfQUxQSEFfTlVNIDogcmV0dXJuIDExO1xuICAgICAgICBjYXNlIFFSTW9kZS5NT0RFXzhCSVRfQllURSA6IHJldHVybiAxNjtcbiAgICAgICAgY2FzZSBRUk1vZGUuTU9ERV9LQU5KSSAgICAgOiByZXR1cm4gMTA7XG4gICAgICAgIGRlZmF1bHQgOlxuICAgICAgICAgIHRocm93ICdtb2RlOicgKyBtb2RlO1xuICAgICAgICB9XG5cbiAgICAgIH0gZWxzZSBpZiAodHlwZSA8IDQxKSB7XG5cbiAgICAgICAgLy8gMjcgLSA0MFxuXG4gICAgICAgIHN3aXRjaChtb2RlKSB7XG4gICAgICAgIGNhc2UgUVJNb2RlLk1PREVfTlVNQkVSICAgIDogcmV0dXJuIDE0O1xuICAgICAgICBjYXNlIFFSTW9kZS5NT0RFX0FMUEhBX05VTSA6IHJldHVybiAxMztcbiAgICAgICAgY2FzZSBRUk1vZGUuTU9ERV84QklUX0JZVEUgOiByZXR1cm4gMTY7XG4gICAgICAgIGNhc2UgUVJNb2RlLk1PREVfS0FOSkkgICAgIDogcmV0dXJuIDEyO1xuICAgICAgICBkZWZhdWx0IDpcbiAgICAgICAgICB0aHJvdyAnbW9kZTonICsgbW9kZTtcbiAgICAgICAgfVxuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyAndHlwZTonICsgdHlwZTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgX3RoaXMuZ2V0TG9zdFBvaW50ID0gZnVuY3Rpb24ocXJjb2RlKSB7XG5cbiAgICAgIHZhciBtb2R1bGVDb3VudCA9IHFyY29kZS5nZXRNb2R1bGVDb3VudCgpO1xuXG4gICAgICB2YXIgbG9zdFBvaW50ID0gMDtcblxuICAgICAgLy8gTEVWRUwxXG5cbiAgICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IG1vZHVsZUNvdW50OyByb3cgKz0gMSkge1xuICAgICAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCBtb2R1bGVDb3VudDsgY29sICs9IDEpIHtcblxuICAgICAgICAgIHZhciBzYW1lQ291bnQgPSAwO1xuICAgICAgICAgIHZhciBkYXJrID0gcXJjb2RlLmlzRGFyayhyb3csIGNvbCk7XG5cbiAgICAgICAgICBmb3IgKHZhciByID0gLTE7IHIgPD0gMTsgciArPSAxKSB7XG5cbiAgICAgICAgICAgIGlmIChyb3cgKyByIDwgMCB8fCBtb2R1bGVDb3VudCA8PSByb3cgKyByKSB7XG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHZhciBjID0gLTE7IGMgPD0gMTsgYyArPSAxKSB7XG5cbiAgICAgICAgICAgICAgaWYgKGNvbCArIGMgPCAwIHx8IG1vZHVsZUNvdW50IDw9IGNvbCArIGMpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmIChyID09IDAgJiYgYyA9PSAwKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAoZGFyayA9PSBxcmNvZGUuaXNEYXJrKHJvdyArIHIsIGNvbCArIGMpICkge1xuICAgICAgICAgICAgICAgIHNhbWVDb3VudCArPSAxO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHNhbWVDb3VudCA+IDUpIHtcbiAgICAgICAgICAgIGxvc3RQb2ludCArPSAoMyArIHNhbWVDb3VudCAtIDUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgLy8gTEVWRUwyXG5cbiAgICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IG1vZHVsZUNvdW50IC0gMTsgcm93ICs9IDEpIHtcbiAgICAgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgbW9kdWxlQ291bnQgLSAxOyBjb2wgKz0gMSkge1xuICAgICAgICAgIHZhciBjb3VudCA9IDA7XG4gICAgICAgICAgaWYgKHFyY29kZS5pc0Rhcmsocm93LCBjb2wpICkgY291bnQgKz0gMTtcbiAgICAgICAgICBpZiAocXJjb2RlLmlzRGFyayhyb3cgKyAxLCBjb2wpICkgY291bnQgKz0gMTtcbiAgICAgICAgICBpZiAocXJjb2RlLmlzRGFyayhyb3csIGNvbCArIDEpICkgY291bnQgKz0gMTtcbiAgICAgICAgICBpZiAocXJjb2RlLmlzRGFyayhyb3cgKyAxLCBjb2wgKyAxKSApIGNvdW50ICs9IDE7XG4gICAgICAgICAgaWYgKGNvdW50ID09IDAgfHwgY291bnQgPT0gNCkge1xuICAgICAgICAgICAgbG9zdFBvaW50ICs9IDM7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIExFVkVMM1xuXG4gICAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCBtb2R1bGVDb3VudDsgcm93ICs9IDEpIHtcbiAgICAgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgbW9kdWxlQ291bnQgLSA2OyBjb2wgKz0gMSkge1xuICAgICAgICAgIGlmIChxcmNvZGUuaXNEYXJrKHJvdywgY29sKVxuICAgICAgICAgICAgICAmJiAhcXJjb2RlLmlzRGFyayhyb3csIGNvbCArIDEpXG4gICAgICAgICAgICAgICYmICBxcmNvZGUuaXNEYXJrKHJvdywgY29sICsgMilcbiAgICAgICAgICAgICAgJiYgIHFyY29kZS5pc0Rhcmsocm93LCBjb2wgKyAzKVxuICAgICAgICAgICAgICAmJiAgcXJjb2RlLmlzRGFyayhyb3csIGNvbCArIDQpXG4gICAgICAgICAgICAgICYmICFxcmNvZGUuaXNEYXJrKHJvdywgY29sICsgNSlcbiAgICAgICAgICAgICAgJiYgIHFyY29kZS5pc0Rhcmsocm93LCBjb2wgKyA2KSApIHtcbiAgICAgICAgICAgIGxvc3RQb2ludCArPSA0MDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgbW9kdWxlQ291bnQ7IGNvbCArPSAxKSB7XG4gICAgICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IG1vZHVsZUNvdW50IC0gNjsgcm93ICs9IDEpIHtcbiAgICAgICAgICBpZiAocXJjb2RlLmlzRGFyayhyb3csIGNvbClcbiAgICAgICAgICAgICAgJiYgIXFyY29kZS5pc0Rhcmsocm93ICsgMSwgY29sKVxuICAgICAgICAgICAgICAmJiAgcXJjb2RlLmlzRGFyayhyb3cgKyAyLCBjb2wpXG4gICAgICAgICAgICAgICYmICBxcmNvZGUuaXNEYXJrKHJvdyArIDMsIGNvbClcbiAgICAgICAgICAgICAgJiYgIHFyY29kZS5pc0Rhcmsocm93ICsgNCwgY29sKVxuICAgICAgICAgICAgICAmJiAhcXJjb2RlLmlzRGFyayhyb3cgKyA1LCBjb2wpXG4gICAgICAgICAgICAgICYmICBxcmNvZGUuaXNEYXJrKHJvdyArIDYsIGNvbCkgKSB7XG4gICAgICAgICAgICBsb3N0UG9pbnQgKz0gNDA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIExFVkVMNFxuXG4gICAgICB2YXIgZGFya0NvdW50ID0gMDtcblxuICAgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgbW9kdWxlQ291bnQ7IGNvbCArPSAxKSB7XG4gICAgICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IG1vZHVsZUNvdW50OyByb3cgKz0gMSkge1xuICAgICAgICAgIGlmIChxcmNvZGUuaXNEYXJrKHJvdywgY29sKSApIHtcbiAgICAgICAgICAgIGRhcmtDb3VudCArPSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgcmF0aW8gPSBNYXRoLmFicygxMDAgKiBkYXJrQ291bnQgLyBtb2R1bGVDb3VudCAvIG1vZHVsZUNvdW50IC0gNTApIC8gNTtcbiAgICAgIGxvc3RQb2ludCArPSByYXRpbyAqIDEwO1xuXG4gICAgICByZXR1cm4gbG9zdFBvaW50O1xuICAgIH07XG5cbiAgICByZXR1cm4gX3RoaXM7XG4gIH0oKTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBRUk1hdGhcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICB2YXIgUVJNYXRoID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgRVhQX1RBQkxFID0gbmV3IEFycmF5KDI1Nik7XG4gICAgdmFyIExPR19UQUJMRSA9IG5ldyBBcnJheSgyNTYpO1xuXG4gICAgLy8gaW5pdGlhbGl6ZSB0YWJsZXNcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDg7IGkgKz0gMSkge1xuICAgICAgRVhQX1RBQkxFW2ldID0gMSA8PCBpO1xuICAgIH1cbiAgICBmb3IgKHZhciBpID0gODsgaSA8IDI1NjsgaSArPSAxKSB7XG4gICAgICBFWFBfVEFCTEVbaV0gPSBFWFBfVEFCTEVbaSAtIDRdXG4gICAgICAgIF4gRVhQX1RBQkxFW2kgLSA1XVxuICAgICAgICBeIEVYUF9UQUJMRVtpIC0gNl1cbiAgICAgICAgXiBFWFBfVEFCTEVbaSAtIDhdO1xuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDI1NTsgaSArPSAxKSB7XG4gICAgICBMT0dfVEFCTEVbRVhQX1RBQkxFW2ldIF0gPSBpO1xuICAgIH1cblxuICAgIHZhciBfdGhpcyA9IHt9O1xuXG4gICAgX3RoaXMuZ2xvZyA9IGZ1bmN0aW9uKG4pIHtcblxuICAgICAgaWYgKG4gPCAxKSB7XG4gICAgICAgIHRocm93ICdnbG9nKCcgKyBuICsgJyknO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gTE9HX1RBQkxFW25dO1xuICAgIH07XG5cbiAgICBfdGhpcy5nZXhwID0gZnVuY3Rpb24obikge1xuXG4gICAgICB3aGlsZSAobiA8IDApIHtcbiAgICAgICAgbiArPSAyNTU7XG4gICAgICB9XG5cbiAgICAgIHdoaWxlIChuID49IDI1Nikge1xuICAgICAgICBuIC09IDI1NTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIEVYUF9UQUJMRVtuXTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIF90aGlzO1xuICB9KCk7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gcXJQb2x5bm9taWFsXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgZnVuY3Rpb24gcXJQb2x5bm9taWFsKG51bSwgc2hpZnQpIHtcblxuICAgIGlmICh0eXBlb2YgbnVtLmxlbmd0aCA9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3cgbnVtLmxlbmd0aCArICcvJyArIHNoaWZ0O1xuICAgIH1cblxuICAgIHZhciBfbnVtID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgb2Zmc2V0ID0gMDtcbiAgICAgIHdoaWxlIChvZmZzZXQgPCBudW0ubGVuZ3RoICYmIG51bVtvZmZzZXRdID09IDApIHtcbiAgICAgICAgb2Zmc2V0ICs9IDE7XG4gICAgICB9XG4gICAgICB2YXIgX251bSA9IG5ldyBBcnJheShudW0ubGVuZ3RoIC0gb2Zmc2V0ICsgc2hpZnQpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW0ubGVuZ3RoIC0gb2Zmc2V0OyBpICs9IDEpIHtcbiAgICAgICAgX251bVtpXSA9IG51bVtpICsgb2Zmc2V0XTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBfbnVtO1xuICAgIH0oKTtcblxuICAgIHZhciBfdGhpcyA9IHt9O1xuXG4gICAgX3RoaXMuZ2V0QXQgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgcmV0dXJuIF9udW1baW5kZXhdO1xuICAgIH07XG5cbiAgICBfdGhpcy5nZXRMZW5ndGggPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfbnVtLmxlbmd0aDtcbiAgICB9O1xuXG4gICAgX3RoaXMubXVsdGlwbHkgPSBmdW5jdGlvbihlKSB7XG5cbiAgICAgIHZhciBudW0gPSBuZXcgQXJyYXkoX3RoaXMuZ2V0TGVuZ3RoKCkgKyBlLmdldExlbmd0aCgpIC0gMSk7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX3RoaXMuZ2V0TGVuZ3RoKCk7IGkgKz0gMSkge1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGUuZ2V0TGVuZ3RoKCk7IGogKz0gMSkge1xuICAgICAgICAgIG51bVtpICsgal0gXj0gUVJNYXRoLmdleHAoUVJNYXRoLmdsb2coX3RoaXMuZ2V0QXQoaSkgKSArIFFSTWF0aC5nbG9nKGUuZ2V0QXQoaikgKSApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBxclBvbHlub21pYWwobnVtLCAwKTtcbiAgICB9O1xuXG4gICAgX3RoaXMubW9kID0gZnVuY3Rpb24oZSkge1xuXG4gICAgICBpZiAoX3RoaXMuZ2V0TGVuZ3RoKCkgLSBlLmdldExlbmd0aCgpIDwgMCkge1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgICB9XG5cbiAgICAgIHZhciByYXRpbyA9IFFSTWF0aC5nbG9nKF90aGlzLmdldEF0KDApICkgLSBRUk1hdGguZ2xvZyhlLmdldEF0KDApICk7XG5cbiAgICAgIHZhciBudW0gPSBuZXcgQXJyYXkoX3RoaXMuZ2V0TGVuZ3RoKCkgKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX3RoaXMuZ2V0TGVuZ3RoKCk7IGkgKz0gMSkge1xuICAgICAgICBudW1baV0gPSBfdGhpcy5nZXRBdChpKTtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlLmdldExlbmd0aCgpOyBpICs9IDEpIHtcbiAgICAgICAgbnVtW2ldIF49IFFSTWF0aC5nZXhwKFFSTWF0aC5nbG9nKGUuZ2V0QXQoaSkgKSArIHJhdGlvKTtcbiAgICAgIH1cblxuICAgICAgLy8gcmVjdXJzaXZlIGNhbGxcbiAgICAgIHJldHVybiBxclBvbHlub21pYWwobnVtLCAwKS5tb2QoZSk7XG4gICAgfTtcblxuICAgIHJldHVybiBfdGhpcztcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBRUlJTQmxvY2tcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICB2YXIgUVJSU0Jsb2NrID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgUlNfQkxPQ0tfVEFCTEUgPSBbXG5cbiAgICAgIC8vIExcbiAgICAgIC8vIE1cbiAgICAgIC8vIFFcbiAgICAgIC8vIEhcblxuICAgICAgLy8gMVxuICAgICAgWzEsIDI2LCAxOV0sXG4gICAgICBbMSwgMjYsIDE2XSxcbiAgICAgIFsxLCAyNiwgMTNdLFxuICAgICAgWzEsIDI2LCA5XSxcblxuICAgICAgLy8gMlxuICAgICAgWzEsIDQ0LCAzNF0sXG4gICAgICBbMSwgNDQsIDI4XSxcbiAgICAgIFsxLCA0NCwgMjJdLFxuICAgICAgWzEsIDQ0LCAxNl0sXG5cbiAgICAgIC8vIDNcbiAgICAgIFsxLCA3MCwgNTVdLFxuICAgICAgWzEsIDcwLCA0NF0sXG4gICAgICBbMiwgMzUsIDE3XSxcbiAgICAgIFsyLCAzNSwgMTNdLFxuXG4gICAgICAvLyA0XG4gICAgICBbMSwgMTAwLCA4MF0sXG4gICAgICBbMiwgNTAsIDMyXSxcbiAgICAgIFsyLCA1MCwgMjRdLFxuICAgICAgWzQsIDI1LCA5XSxcblxuICAgICAgLy8gNVxuICAgICAgWzEsIDEzNCwgMTA4XSxcbiAgICAgIFsyLCA2NywgNDNdLFxuICAgICAgWzIsIDMzLCAxNSwgMiwgMzQsIDE2XSxcbiAgICAgIFsyLCAzMywgMTEsIDIsIDM0LCAxMl0sXG5cbiAgICAgIC8vIDZcbiAgICAgIFsyLCA4NiwgNjhdLFxuICAgICAgWzQsIDQzLCAyN10sXG4gICAgICBbNCwgNDMsIDE5XSxcbiAgICAgIFs0LCA0MywgMTVdLFxuXG4gICAgICAvLyA3XG4gICAgICBbMiwgOTgsIDc4XSxcbiAgICAgIFs0LCA0OSwgMzFdLFxuICAgICAgWzIsIDMyLCAxNCwgNCwgMzMsIDE1XSxcbiAgICAgIFs0LCAzOSwgMTMsIDEsIDQwLCAxNF0sXG5cbiAgICAgIC8vIDhcbiAgICAgIFsyLCAxMjEsIDk3XSxcbiAgICAgIFsyLCA2MCwgMzgsIDIsIDYxLCAzOV0sXG4gICAgICBbNCwgNDAsIDE4LCAyLCA0MSwgMTldLFxuICAgICAgWzQsIDQwLCAxNCwgMiwgNDEsIDE1XSxcblxuICAgICAgLy8gOVxuICAgICAgWzIsIDE0NiwgMTE2XSxcbiAgICAgIFszLCA1OCwgMzYsIDIsIDU5LCAzN10sXG4gICAgICBbNCwgMzYsIDE2LCA0LCAzNywgMTddLFxuICAgICAgWzQsIDM2LCAxMiwgNCwgMzcsIDEzXSxcblxuICAgICAgLy8gMTBcbiAgICAgIFsyLCA4NiwgNjgsIDIsIDg3LCA2OV0sXG4gICAgICBbNCwgNjksIDQzLCAxLCA3MCwgNDRdLFxuICAgICAgWzYsIDQzLCAxOSwgMiwgNDQsIDIwXSxcbiAgICAgIFs2LCA0MywgMTUsIDIsIDQ0LCAxNl0sXG5cbiAgICAgIC8vIDExXG4gICAgICBbNCwgMTAxLCA4MV0sXG4gICAgICBbMSwgODAsIDUwLCA0LCA4MSwgNTFdLFxuICAgICAgWzQsIDUwLCAyMiwgNCwgNTEsIDIzXSxcbiAgICAgIFszLCAzNiwgMTIsIDgsIDM3LCAxM10sXG5cbiAgICAgIC8vIDEyXG4gICAgICBbMiwgMTE2LCA5MiwgMiwgMTE3LCA5M10sXG4gICAgICBbNiwgNTgsIDM2LCAyLCA1OSwgMzddLFxuICAgICAgWzQsIDQ2LCAyMCwgNiwgNDcsIDIxXSxcbiAgICAgIFs3LCA0MiwgMTQsIDQsIDQzLCAxNV0sXG5cbiAgICAgIC8vIDEzXG4gICAgICBbNCwgMTMzLCAxMDddLFxuICAgICAgWzgsIDU5LCAzNywgMSwgNjAsIDM4XSxcbiAgICAgIFs4LCA0NCwgMjAsIDQsIDQ1LCAyMV0sXG4gICAgICBbMTIsIDMzLCAxMSwgNCwgMzQsIDEyXSxcblxuICAgICAgLy8gMTRcbiAgICAgIFszLCAxNDUsIDExNSwgMSwgMTQ2LCAxMTZdLFxuICAgICAgWzQsIDY0LCA0MCwgNSwgNjUsIDQxXSxcbiAgICAgIFsxMSwgMzYsIDE2LCA1LCAzNywgMTddLFxuICAgICAgWzExLCAzNiwgMTIsIDUsIDM3LCAxM10sXG5cbiAgICAgIC8vIDE1XG4gICAgICBbNSwgMTA5LCA4NywgMSwgMTEwLCA4OF0sXG4gICAgICBbNSwgNjUsIDQxLCA1LCA2NiwgNDJdLFxuICAgICAgWzUsIDU0LCAyNCwgNywgNTUsIDI1XSxcbiAgICAgIFsxMSwgMzYsIDEyLCA3LCAzNywgMTNdLFxuXG4gICAgICAvLyAxNlxuICAgICAgWzUsIDEyMiwgOTgsIDEsIDEyMywgOTldLFxuICAgICAgWzcsIDczLCA0NSwgMywgNzQsIDQ2XSxcbiAgICAgIFsxNSwgNDMsIDE5LCAyLCA0NCwgMjBdLFxuICAgICAgWzMsIDQ1LCAxNSwgMTMsIDQ2LCAxNl0sXG5cbiAgICAgIC8vIDE3XG4gICAgICBbMSwgMTM1LCAxMDcsIDUsIDEzNiwgMTA4XSxcbiAgICAgIFsxMCwgNzQsIDQ2LCAxLCA3NSwgNDddLFxuICAgICAgWzEsIDUwLCAyMiwgMTUsIDUxLCAyM10sXG4gICAgICBbMiwgNDIsIDE0LCAxNywgNDMsIDE1XSxcblxuICAgICAgLy8gMThcbiAgICAgIFs1LCAxNTAsIDEyMCwgMSwgMTUxLCAxMjFdLFxuICAgICAgWzksIDY5LCA0MywgNCwgNzAsIDQ0XSxcbiAgICAgIFsxNywgNTAsIDIyLCAxLCA1MSwgMjNdLFxuICAgICAgWzIsIDQyLCAxNCwgMTksIDQzLCAxNV0sXG5cbiAgICAgIC8vIDE5XG4gICAgICBbMywgMTQxLCAxMTMsIDQsIDE0MiwgMTE0XSxcbiAgICAgIFszLCA3MCwgNDQsIDExLCA3MSwgNDVdLFxuICAgICAgWzE3LCA0NywgMjEsIDQsIDQ4LCAyMl0sXG4gICAgICBbOSwgMzksIDEzLCAxNiwgNDAsIDE0XSxcblxuICAgICAgLy8gMjBcbiAgICAgIFszLCAxMzUsIDEwNywgNSwgMTM2LCAxMDhdLFxuICAgICAgWzMsIDY3LCA0MSwgMTMsIDY4LCA0Ml0sXG4gICAgICBbMTUsIDU0LCAyNCwgNSwgNTUsIDI1XSxcbiAgICAgIFsxNSwgNDMsIDE1LCAxMCwgNDQsIDE2XSxcblxuICAgICAgLy8gMjFcbiAgICAgIFs0LCAxNDQsIDExNiwgNCwgMTQ1LCAxMTddLFxuICAgICAgWzE3LCA2OCwgNDJdLFxuICAgICAgWzE3LCA1MCwgMjIsIDYsIDUxLCAyM10sXG4gICAgICBbMTksIDQ2LCAxNiwgNiwgNDcsIDE3XSxcblxuICAgICAgLy8gMjJcbiAgICAgIFsyLCAxMzksIDExMSwgNywgMTQwLCAxMTJdLFxuICAgICAgWzE3LCA3NCwgNDZdLFxuICAgICAgWzcsIDU0LCAyNCwgMTYsIDU1LCAyNV0sXG4gICAgICBbMzQsIDM3LCAxM10sXG5cbiAgICAgIC8vIDIzXG4gICAgICBbNCwgMTUxLCAxMjEsIDUsIDE1MiwgMTIyXSxcbiAgICAgIFs0LCA3NSwgNDcsIDE0LCA3NiwgNDhdLFxuICAgICAgWzExLCA1NCwgMjQsIDE0LCA1NSwgMjVdLFxuICAgICAgWzE2LCA0NSwgMTUsIDE0LCA0NiwgMTZdLFxuXG4gICAgICAvLyAyNFxuICAgICAgWzYsIDE0NywgMTE3LCA0LCAxNDgsIDExOF0sXG4gICAgICBbNiwgNzMsIDQ1LCAxNCwgNzQsIDQ2XSxcbiAgICAgIFsxMSwgNTQsIDI0LCAxNiwgNTUsIDI1XSxcbiAgICAgIFszMCwgNDYsIDE2LCAyLCA0NywgMTddLFxuXG4gICAgICAvLyAyNVxuICAgICAgWzgsIDEzMiwgMTA2LCA0LCAxMzMsIDEwN10sXG4gICAgICBbOCwgNzUsIDQ3LCAxMywgNzYsIDQ4XSxcbiAgICAgIFs3LCA1NCwgMjQsIDIyLCA1NSwgMjVdLFxuICAgICAgWzIyLCA0NSwgMTUsIDEzLCA0NiwgMTZdLFxuXG4gICAgICAvLyAyNlxuICAgICAgWzEwLCAxNDIsIDExNCwgMiwgMTQzLCAxMTVdLFxuICAgICAgWzE5LCA3NCwgNDYsIDQsIDc1LCA0N10sXG4gICAgICBbMjgsIDUwLCAyMiwgNiwgNTEsIDIzXSxcbiAgICAgIFszMywgNDYsIDE2LCA0LCA0NywgMTddLFxuXG4gICAgICAvLyAyN1xuICAgICAgWzgsIDE1MiwgMTIyLCA0LCAxNTMsIDEyM10sXG4gICAgICBbMjIsIDczLCA0NSwgMywgNzQsIDQ2XSxcbiAgICAgIFs4LCA1MywgMjMsIDI2LCA1NCwgMjRdLFxuICAgICAgWzEyLCA0NSwgMTUsIDI4LCA0NiwgMTZdLFxuXG4gICAgICAvLyAyOFxuICAgICAgWzMsIDE0NywgMTE3LCAxMCwgMTQ4LCAxMThdLFxuICAgICAgWzMsIDczLCA0NSwgMjMsIDc0LCA0Nl0sXG4gICAgICBbNCwgNTQsIDI0LCAzMSwgNTUsIDI1XSxcbiAgICAgIFsxMSwgNDUsIDE1LCAzMSwgNDYsIDE2XSxcblxuICAgICAgLy8gMjlcbiAgICAgIFs3LCAxNDYsIDExNiwgNywgMTQ3LCAxMTddLFxuICAgICAgWzIxLCA3MywgNDUsIDcsIDc0LCA0Nl0sXG4gICAgICBbMSwgNTMsIDIzLCAzNywgNTQsIDI0XSxcbiAgICAgIFsxOSwgNDUsIDE1LCAyNiwgNDYsIDE2XSxcblxuICAgICAgLy8gMzBcbiAgICAgIFs1LCAxNDUsIDExNSwgMTAsIDE0NiwgMTE2XSxcbiAgICAgIFsxOSwgNzUsIDQ3LCAxMCwgNzYsIDQ4XSxcbiAgICAgIFsxNSwgNTQsIDI0LCAyNSwgNTUsIDI1XSxcbiAgICAgIFsyMywgNDUsIDE1LCAyNSwgNDYsIDE2XSxcblxuICAgICAgLy8gMzFcbiAgICAgIFsxMywgMTQ1LCAxMTUsIDMsIDE0NiwgMTE2XSxcbiAgICAgIFsyLCA3NCwgNDYsIDI5LCA3NSwgNDddLFxuICAgICAgWzQyLCA1NCwgMjQsIDEsIDU1LCAyNV0sXG4gICAgICBbMjMsIDQ1LCAxNSwgMjgsIDQ2LCAxNl0sXG5cbiAgICAgIC8vIDMyXG4gICAgICBbMTcsIDE0NSwgMTE1XSxcbiAgICAgIFsxMCwgNzQsIDQ2LCAyMywgNzUsIDQ3XSxcbiAgICAgIFsxMCwgNTQsIDI0LCAzNSwgNTUsIDI1XSxcbiAgICAgIFsxOSwgNDUsIDE1LCAzNSwgNDYsIDE2XSxcblxuICAgICAgLy8gMzNcbiAgICAgIFsxNywgMTQ1LCAxMTUsIDEsIDE0NiwgMTE2XSxcbiAgICAgIFsxNCwgNzQsIDQ2LCAyMSwgNzUsIDQ3XSxcbiAgICAgIFsyOSwgNTQsIDI0LCAxOSwgNTUsIDI1XSxcbiAgICAgIFsxMSwgNDUsIDE1LCA0NiwgNDYsIDE2XSxcblxuICAgICAgLy8gMzRcbiAgICAgIFsxMywgMTQ1LCAxMTUsIDYsIDE0NiwgMTE2XSxcbiAgICAgIFsxNCwgNzQsIDQ2LCAyMywgNzUsIDQ3XSxcbiAgICAgIFs0NCwgNTQsIDI0LCA3LCA1NSwgMjVdLFxuICAgICAgWzU5LCA0NiwgMTYsIDEsIDQ3LCAxN10sXG5cbiAgICAgIC8vIDM1XG4gICAgICBbMTIsIDE1MSwgMTIxLCA3LCAxNTIsIDEyMl0sXG4gICAgICBbMTIsIDc1LCA0NywgMjYsIDc2LCA0OF0sXG4gICAgICBbMzksIDU0LCAyNCwgMTQsIDU1LCAyNV0sXG4gICAgICBbMjIsIDQ1LCAxNSwgNDEsIDQ2LCAxNl0sXG5cbiAgICAgIC8vIDM2XG4gICAgICBbNiwgMTUxLCAxMjEsIDE0LCAxNTIsIDEyMl0sXG4gICAgICBbNiwgNzUsIDQ3LCAzNCwgNzYsIDQ4XSxcbiAgICAgIFs0NiwgNTQsIDI0LCAxMCwgNTUsIDI1XSxcbiAgICAgIFsyLCA0NSwgMTUsIDY0LCA0NiwgMTZdLFxuXG4gICAgICAvLyAzN1xuICAgICAgWzE3LCAxNTIsIDEyMiwgNCwgMTUzLCAxMjNdLFxuICAgICAgWzI5LCA3NCwgNDYsIDE0LCA3NSwgNDddLFxuICAgICAgWzQ5LCA1NCwgMjQsIDEwLCA1NSwgMjVdLFxuICAgICAgWzI0LCA0NSwgMTUsIDQ2LCA0NiwgMTZdLFxuXG4gICAgICAvLyAzOFxuICAgICAgWzQsIDE1MiwgMTIyLCAxOCwgMTUzLCAxMjNdLFxuICAgICAgWzEzLCA3NCwgNDYsIDMyLCA3NSwgNDddLFxuICAgICAgWzQ4LCA1NCwgMjQsIDE0LCA1NSwgMjVdLFxuICAgICAgWzQyLCA0NSwgMTUsIDMyLCA0NiwgMTZdLFxuXG4gICAgICAvLyAzOVxuICAgICAgWzIwLCAxNDcsIDExNywgNCwgMTQ4LCAxMThdLFxuICAgICAgWzQwLCA3NSwgNDcsIDcsIDc2LCA0OF0sXG4gICAgICBbNDMsIDU0LCAyNCwgMjIsIDU1LCAyNV0sXG4gICAgICBbMTAsIDQ1LCAxNSwgNjcsIDQ2LCAxNl0sXG5cbiAgICAgIC8vIDQwXG4gICAgICBbMTksIDE0OCwgMTE4LCA2LCAxNDksIDExOV0sXG4gICAgICBbMTgsIDc1LCA0NywgMzEsIDc2LCA0OF0sXG4gICAgICBbMzQsIDU0LCAyNCwgMzQsIDU1LCAyNV0sXG4gICAgICBbMjAsIDQ1LCAxNSwgNjEsIDQ2LCAxNl1cbiAgICBdO1xuXG4gICAgdmFyIHFyUlNCbG9jayA9IGZ1bmN0aW9uKHRvdGFsQ291bnQsIGRhdGFDb3VudCkge1xuICAgICAgdmFyIF90aGlzID0ge307XG4gICAgICBfdGhpcy50b3RhbENvdW50ID0gdG90YWxDb3VudDtcbiAgICAgIF90aGlzLmRhdGFDb3VudCA9IGRhdGFDb3VudDtcbiAgICAgIHJldHVybiBfdGhpcztcbiAgICB9O1xuXG4gICAgdmFyIF90aGlzID0ge307XG5cbiAgICB2YXIgZ2V0UnNCbG9ja1RhYmxlID0gZnVuY3Rpb24odHlwZU51bWJlciwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpIHtcblxuICAgICAgc3dpdGNoKGVycm9yQ29ycmVjdGlvbkxldmVsKSB7XG4gICAgICBjYXNlIFFSRXJyb3JDb3JyZWN0aW9uTGV2ZWwuTCA6XG4gICAgICAgIHJldHVybiBSU19CTE9DS19UQUJMRVsodHlwZU51bWJlciAtIDEpICogNCArIDBdO1xuICAgICAgY2FzZSBRUkVycm9yQ29ycmVjdGlvbkxldmVsLk0gOlxuICAgICAgICByZXR1cm4gUlNfQkxPQ0tfVEFCTEVbKHR5cGVOdW1iZXIgLSAxKSAqIDQgKyAxXTtcbiAgICAgIGNhc2UgUVJFcnJvckNvcnJlY3Rpb25MZXZlbC5RIDpcbiAgICAgICAgcmV0dXJuIFJTX0JMT0NLX1RBQkxFWyh0eXBlTnVtYmVyIC0gMSkgKiA0ICsgMl07XG4gICAgICBjYXNlIFFSRXJyb3JDb3JyZWN0aW9uTGV2ZWwuSCA6XG4gICAgICAgIHJldHVybiBSU19CTE9DS19UQUJMRVsodHlwZU51bWJlciAtIDEpICogNCArIDNdO1xuICAgICAgZGVmYXVsdCA6XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfTtcblxuICAgIF90aGlzLmdldFJTQmxvY2tzID0gZnVuY3Rpb24odHlwZU51bWJlciwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpIHtcblxuICAgICAgdmFyIHJzQmxvY2sgPSBnZXRSc0Jsb2NrVGFibGUodHlwZU51bWJlciwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpO1xuXG4gICAgICBpZiAodHlwZW9mIHJzQmxvY2sgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdGhyb3cgJ2JhZCBycyBibG9jayBAIHR5cGVOdW1iZXI6JyArIHR5cGVOdW1iZXIgK1xuICAgICAgICAgICAgJy9lcnJvckNvcnJlY3Rpb25MZXZlbDonICsgZXJyb3JDb3JyZWN0aW9uTGV2ZWw7XG4gICAgICB9XG5cbiAgICAgIHZhciBsZW5ndGggPSByc0Jsb2NrLmxlbmd0aCAvIDM7XG5cbiAgICAgIHZhciBsaXN0ID0gW107XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpICs9IDEpIHtcblxuICAgICAgICB2YXIgY291bnQgPSByc0Jsb2NrW2kgKiAzICsgMF07XG4gICAgICAgIHZhciB0b3RhbENvdW50ID0gcnNCbG9ja1tpICogMyArIDFdO1xuICAgICAgICB2YXIgZGF0YUNvdW50ID0gcnNCbG9ja1tpICogMyArIDJdO1xuXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgY291bnQ7IGogKz0gMSkge1xuICAgICAgICAgIGxpc3QucHVzaChxclJTQmxvY2sodG90YWxDb3VudCwgZGF0YUNvdW50KSApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBsaXN0O1xuICAgIH07XG5cbiAgICByZXR1cm4gX3RoaXM7XG4gIH0oKTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBxckJpdEJ1ZmZlclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHZhciBxckJpdEJ1ZmZlciA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIF9idWZmZXIgPSBbXTtcbiAgICB2YXIgX2xlbmd0aCA9IDA7XG5cbiAgICB2YXIgX3RoaXMgPSB7fTtcblxuICAgIF90aGlzLmdldEJ1ZmZlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF9idWZmZXI7XG4gICAgfTtcblxuICAgIF90aGlzLmdldEF0ID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgIHZhciBidWZJbmRleCA9IE1hdGguZmxvb3IoaW5kZXggLyA4KTtcbiAgICAgIHJldHVybiAoIChfYnVmZmVyW2J1ZkluZGV4XSA+Pj4gKDcgLSBpbmRleCAlIDgpICkgJiAxKSA9PSAxO1xuICAgIH07XG5cbiAgICBfdGhpcy5wdXQgPSBmdW5jdGlvbihudW0sIGxlbmd0aCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBfdGhpcy5wdXRCaXQoICggKG51bSA+Pj4gKGxlbmd0aCAtIGkgLSAxKSApICYgMSkgPT0gMSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIF90aGlzLmdldExlbmd0aEluQml0cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF9sZW5ndGg7XG4gICAgfTtcblxuICAgIF90aGlzLnB1dEJpdCA9IGZ1bmN0aW9uKGJpdCkge1xuXG4gICAgICB2YXIgYnVmSW5kZXggPSBNYXRoLmZsb29yKF9sZW5ndGggLyA4KTtcbiAgICAgIGlmIChfYnVmZmVyLmxlbmd0aCA8PSBidWZJbmRleCkge1xuICAgICAgICBfYnVmZmVyLnB1c2goMCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChiaXQpIHtcbiAgICAgICAgX2J1ZmZlcltidWZJbmRleF0gfD0gKDB4ODAgPj4+IChfbGVuZ3RoICUgOCkgKTtcbiAgICAgIH1cblxuICAgICAgX2xlbmd0aCArPSAxO1xuICAgIH07XG5cbiAgICByZXR1cm4gX3RoaXM7XG4gIH07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gcXJOdW1iZXJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICB2YXIgcXJOdW1iZXIgPSBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICB2YXIgX21vZGUgPSBRUk1vZGUuTU9ERV9OVU1CRVI7XG4gICAgdmFyIF9kYXRhID0gZGF0YTtcblxuICAgIHZhciBfdGhpcyA9IHt9O1xuXG4gICAgX3RoaXMuZ2V0TW9kZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF9tb2RlO1xuICAgIH07XG5cbiAgICBfdGhpcy5nZXRMZW5ndGggPSBmdW5jdGlvbihidWZmZXIpIHtcbiAgICAgIHJldHVybiBfZGF0YS5sZW5ndGg7XG4gICAgfTtcblxuICAgIF90aGlzLndyaXRlID0gZnVuY3Rpb24oYnVmZmVyKSB7XG5cbiAgICAgIHZhciBkYXRhID0gX2RhdGE7XG5cbiAgICAgIHZhciBpID0gMDtcblxuICAgICAgd2hpbGUgKGkgKyAyIDwgZGF0YS5sZW5ndGgpIHtcbiAgICAgICAgYnVmZmVyLnB1dChzdHJUb051bShkYXRhLnN1YnN0cmluZyhpLCBpICsgMykgKSwgMTApO1xuICAgICAgICBpICs9IDM7XG4gICAgICB9XG5cbiAgICAgIGlmIChpIDwgZGF0YS5sZW5ndGgpIHtcbiAgICAgICAgaWYgKGRhdGEubGVuZ3RoIC0gaSA9PSAxKSB7XG4gICAgICAgICAgYnVmZmVyLnB1dChzdHJUb051bShkYXRhLnN1YnN0cmluZyhpLCBpICsgMSkgKSwgNCk7XG4gICAgICAgIH0gZWxzZSBpZiAoZGF0YS5sZW5ndGggLSBpID09IDIpIHtcbiAgICAgICAgICBidWZmZXIucHV0KHN0clRvTnVtKGRhdGEuc3Vic3RyaW5nKGksIGkgKyAyKSApLCA3KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgc3RyVG9OdW0gPSBmdW5jdGlvbihzKSB7XG4gICAgICB2YXIgbnVtID0gMDtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBudW0gPSBudW0gKiAxMCArIGNoYXRUb051bShzLmNoYXJBdChpKSApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG51bTtcbiAgICB9O1xuXG4gICAgdmFyIGNoYXRUb051bSA9IGZ1bmN0aW9uKGMpIHtcbiAgICAgIGlmICgnMCcgPD0gYyAmJiBjIDw9ICc5Jykge1xuICAgICAgICByZXR1cm4gYy5jaGFyQ29kZUF0KDApIC0gJzAnLmNoYXJDb2RlQXQoMCk7XG4gICAgICB9XG4gICAgICB0aHJvdyAnaWxsZWdhbCBjaGFyIDonICsgYztcbiAgICB9O1xuXG4gICAgcmV0dXJuIF90aGlzO1xuICB9O1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIHFyQWxwaGFOdW1cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICB2YXIgcXJBbHBoYU51bSA9IGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgIHZhciBfbW9kZSA9IFFSTW9kZS5NT0RFX0FMUEhBX05VTTtcbiAgICB2YXIgX2RhdGEgPSBkYXRhO1xuXG4gICAgdmFyIF90aGlzID0ge307XG5cbiAgICBfdGhpcy5nZXRNb2RlID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gX21vZGU7XG4gICAgfTtcblxuICAgIF90aGlzLmdldExlbmd0aCA9IGZ1bmN0aW9uKGJ1ZmZlcikge1xuICAgICAgcmV0dXJuIF9kYXRhLmxlbmd0aDtcbiAgICB9O1xuXG4gICAgX3RoaXMud3JpdGUgPSBmdW5jdGlvbihidWZmZXIpIHtcblxuICAgICAgdmFyIHMgPSBfZGF0YTtcblxuICAgICAgdmFyIGkgPSAwO1xuXG4gICAgICB3aGlsZSAoaSArIDEgPCBzLmxlbmd0aCkge1xuICAgICAgICBidWZmZXIucHV0KFxuICAgICAgICAgIGdldENvZGUocy5jaGFyQXQoaSkgKSAqIDQ1ICtcbiAgICAgICAgICBnZXRDb2RlKHMuY2hhckF0KGkgKyAxKSApLCAxMSk7XG4gICAgICAgIGkgKz0gMjtcbiAgICAgIH1cblxuICAgICAgaWYgKGkgPCBzLmxlbmd0aCkge1xuICAgICAgICBidWZmZXIucHV0KGdldENvZGUocy5jaGFyQXQoaSkgKSwgNik7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciBnZXRDb2RlID0gZnVuY3Rpb24oYykge1xuXG4gICAgICBpZiAoJzAnIDw9IGMgJiYgYyA8PSAnOScpIHtcbiAgICAgICAgcmV0dXJuIGMuY2hhckNvZGVBdCgwKSAtICcwJy5jaGFyQ29kZUF0KDApO1xuICAgICAgfSBlbHNlIGlmICgnQScgPD0gYyAmJiBjIDw9ICdaJykge1xuICAgICAgICByZXR1cm4gYy5jaGFyQ29kZUF0KDApIC0gJ0EnLmNoYXJDb2RlQXQoMCkgKyAxMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN3aXRjaCAoYykge1xuICAgICAgICBjYXNlICcgJyA6IHJldHVybiAzNjtcbiAgICAgICAgY2FzZSAnJCcgOiByZXR1cm4gMzc7XG4gICAgICAgIGNhc2UgJyUnIDogcmV0dXJuIDM4O1xuICAgICAgICBjYXNlICcqJyA6IHJldHVybiAzOTtcbiAgICAgICAgY2FzZSAnKycgOiByZXR1cm4gNDA7XG4gICAgICAgIGNhc2UgJy0nIDogcmV0dXJuIDQxO1xuICAgICAgICBjYXNlICcuJyA6IHJldHVybiA0MjtcbiAgICAgICAgY2FzZSAnLycgOiByZXR1cm4gNDM7XG4gICAgICAgIGNhc2UgJzonIDogcmV0dXJuIDQ0O1xuICAgICAgICBkZWZhdWx0IDpcbiAgICAgICAgICB0aHJvdyAnaWxsZWdhbCBjaGFyIDonICsgYztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gX3RoaXM7XG4gIH07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gcXI4Qml0Qnl0ZVxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHZhciBxcjhCaXRCeXRlID0gZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgdmFyIF9tb2RlID0gUVJNb2RlLk1PREVfOEJJVF9CWVRFO1xuICAgIHZhciBfZGF0YSA9IGRhdGE7XG4gICAgdmFyIF9ieXRlcyA9IHFyY29kZS5zdHJpbmdUb0J5dGVzKGRhdGEpO1xuXG4gICAgdmFyIF90aGlzID0ge307XG5cbiAgICBfdGhpcy5nZXRNb2RlID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gX21vZGU7XG4gICAgfTtcblxuICAgIF90aGlzLmdldExlbmd0aCA9IGZ1bmN0aW9uKGJ1ZmZlcikge1xuICAgICAgcmV0dXJuIF9ieXRlcy5sZW5ndGg7XG4gICAgfTtcblxuICAgIF90aGlzLndyaXRlID0gZnVuY3Rpb24oYnVmZmVyKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IF9ieXRlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBidWZmZXIucHV0KF9ieXRlc1tpXSwgOCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBfdGhpcztcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBxckthbmppXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIHFyS2FuamkgPSBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICB2YXIgX21vZGUgPSBRUk1vZGUuTU9ERV9LQU5KSTtcbiAgICB2YXIgX2RhdGEgPSBkYXRhO1xuXG4gICAgdmFyIHN0cmluZ1RvQnl0ZXMgPSBxcmNvZGUuc3RyaW5nVG9CeXRlc0Z1bmNzWydTSklTJ107XG4gICAgaWYgKCFzdHJpbmdUb0J5dGVzKSB7XG4gICAgICB0aHJvdyAnc2ppcyBub3Qgc3VwcG9ydGVkLic7XG4gICAgfVxuICAgICFmdW5jdGlvbihjLCBjb2RlKSB7XG4gICAgICAvLyBzZWxmIHRlc3QgZm9yIHNqaXMgc3VwcG9ydC5cbiAgICAgIHZhciB0ZXN0ID0gc3RyaW5nVG9CeXRlcyhjKTtcbiAgICAgIGlmICh0ZXN0Lmxlbmd0aCAhPSAyIHx8ICggKHRlc3RbMF0gPDwgOCkgfCB0ZXN0WzFdKSAhPSBjb2RlKSB7XG4gICAgICAgIHRocm93ICdzamlzIG5vdCBzdXBwb3J0ZWQuJztcbiAgICAgIH1cbiAgICB9KCdcXHU1M2NiJywgMHg5NzQ2KTtcblxuICAgIHZhciBfYnl0ZXMgPSBzdHJpbmdUb0J5dGVzKGRhdGEpO1xuXG4gICAgdmFyIF90aGlzID0ge307XG5cbiAgICBfdGhpcy5nZXRNb2RlID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gX21vZGU7XG4gICAgfTtcblxuICAgIF90aGlzLmdldExlbmd0aCA9IGZ1bmN0aW9uKGJ1ZmZlcikge1xuICAgICAgcmV0dXJuIH5+KF9ieXRlcy5sZW5ndGggLyAyKTtcbiAgICB9O1xuXG4gICAgX3RoaXMud3JpdGUgPSBmdW5jdGlvbihidWZmZXIpIHtcblxuICAgICAgdmFyIGRhdGEgPSBfYnl0ZXM7XG5cbiAgICAgIHZhciBpID0gMDtcblxuICAgICAgd2hpbGUgKGkgKyAxIDwgZGF0YS5sZW5ndGgpIHtcblxuICAgICAgICB2YXIgYyA9ICggKDB4ZmYgJiBkYXRhW2ldKSA8PCA4KSB8ICgweGZmICYgZGF0YVtpICsgMV0pO1xuXG4gICAgICAgIGlmICgweDgxNDAgPD0gYyAmJiBjIDw9IDB4OUZGQykge1xuICAgICAgICAgIGMgLT0gMHg4MTQwO1xuICAgICAgICB9IGVsc2UgaWYgKDB4RTA0MCA8PSBjICYmIGMgPD0gMHhFQkJGKSB7XG4gICAgICAgICAgYyAtPSAweEMxNDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgJ2lsbGVnYWwgY2hhciBhdCAnICsgKGkgKyAxKSArICcvJyArIGM7XG4gICAgICAgIH1cblxuICAgICAgICBjID0gKCAoYyA+Pj4gOCkgJiAweGZmKSAqIDB4QzAgKyAoYyAmIDB4ZmYpO1xuXG4gICAgICAgIGJ1ZmZlci5wdXQoYywgMTMpO1xuXG4gICAgICAgIGkgKz0gMjtcbiAgICAgIH1cblxuICAgICAgaWYgKGkgPCBkYXRhLmxlbmd0aCkge1xuICAgICAgICB0aHJvdyAnaWxsZWdhbCBjaGFyIGF0ICcgKyAoaSArIDEpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gX3RoaXM7XG4gIH07XG5cbiAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy8gR0lGIFN1cHBvcnQgZXRjLlxuICAvL1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIGJ5dGVBcnJheU91dHB1dFN0cmVhbVxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHZhciBieXRlQXJyYXlPdXRwdXRTdHJlYW0gPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBfYnl0ZXMgPSBbXTtcblxuICAgIHZhciBfdGhpcyA9IHt9O1xuXG4gICAgX3RoaXMud3JpdGVCeXRlID0gZnVuY3Rpb24oYikge1xuICAgICAgX2J5dGVzLnB1c2goYiAmIDB4ZmYpO1xuICAgIH07XG5cbiAgICBfdGhpcy53cml0ZVNob3J0ID0gZnVuY3Rpb24oaSkge1xuICAgICAgX3RoaXMud3JpdGVCeXRlKGkpO1xuICAgICAgX3RoaXMud3JpdGVCeXRlKGkgPj4+IDgpO1xuICAgIH07XG5cbiAgICBfdGhpcy53cml0ZUJ5dGVzID0gZnVuY3Rpb24oYiwgb2ZmLCBsZW4pIHtcbiAgICAgIG9mZiA9IG9mZiB8fCAwO1xuICAgICAgbGVuID0gbGVuIHx8IGIubGVuZ3RoO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkgKz0gMSkge1xuICAgICAgICBfdGhpcy53cml0ZUJ5dGUoYltpICsgb2ZmXSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIF90aGlzLndyaXRlU3RyaW5nID0gZnVuY3Rpb24ocykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIF90aGlzLndyaXRlQnl0ZShzLmNoYXJDb2RlQXQoaSkgKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgX3RoaXMudG9CeXRlQXJyYXkgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfYnl0ZXM7XG4gICAgfTtcblxuICAgIF90aGlzLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcyA9ICcnO1xuICAgICAgcyArPSAnWyc7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IF9ieXRlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBpZiAoaSA+IDApIHtcbiAgICAgICAgICBzICs9ICcsJztcbiAgICAgICAgfVxuICAgICAgICBzICs9IF9ieXRlc1tpXTtcbiAgICAgIH1cbiAgICAgIHMgKz0gJ10nO1xuICAgICAgcmV0dXJuIHM7XG4gICAgfTtcblxuICAgIHJldHVybiBfdGhpcztcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBiYXNlNjRFbmNvZGVPdXRwdXRTdHJlYW1cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICB2YXIgYmFzZTY0RW5jb2RlT3V0cHV0U3RyZWFtID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgX2J1ZmZlciA9IDA7XG4gICAgdmFyIF9idWZsZW4gPSAwO1xuICAgIHZhciBfbGVuZ3RoID0gMDtcbiAgICB2YXIgX2Jhc2U2NCA9ICcnO1xuXG4gICAgdmFyIF90aGlzID0ge307XG5cbiAgICB2YXIgd3JpdGVFbmNvZGVkID0gZnVuY3Rpb24oYikge1xuICAgICAgX2Jhc2U2NCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGVuY29kZShiICYgMHgzZikgKTtcbiAgICB9O1xuXG4gICAgdmFyIGVuY29kZSA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgIGlmIChuIDwgMCkge1xuICAgICAgICAvLyBlcnJvci5cbiAgICAgIH0gZWxzZSBpZiAobiA8IDI2KSB7XG4gICAgICAgIHJldHVybiAweDQxICsgbjtcbiAgICAgIH0gZWxzZSBpZiAobiA8IDUyKSB7XG4gICAgICAgIHJldHVybiAweDYxICsgKG4gLSAyNik7XG4gICAgICB9IGVsc2UgaWYgKG4gPCA2Mikge1xuICAgICAgICByZXR1cm4gMHgzMCArIChuIC0gNTIpO1xuICAgICAgfSBlbHNlIGlmIChuID09IDYyKSB7XG4gICAgICAgIHJldHVybiAweDJiO1xuICAgICAgfSBlbHNlIGlmIChuID09IDYzKSB7XG4gICAgICAgIHJldHVybiAweDJmO1xuICAgICAgfVxuICAgICAgdGhyb3cgJ246JyArIG47XG4gICAgfTtcblxuICAgIF90aGlzLndyaXRlQnl0ZSA9IGZ1bmN0aW9uKG4pIHtcblxuICAgICAgX2J1ZmZlciA9IChfYnVmZmVyIDw8IDgpIHwgKG4gJiAweGZmKTtcbiAgICAgIF9idWZsZW4gKz0gODtcbiAgICAgIF9sZW5ndGggKz0gMTtcblxuICAgICAgd2hpbGUgKF9idWZsZW4gPj0gNikge1xuICAgICAgICB3cml0ZUVuY29kZWQoX2J1ZmZlciA+Pj4gKF9idWZsZW4gLSA2KSApO1xuICAgICAgICBfYnVmbGVuIC09IDY7XG4gICAgICB9XG4gICAgfTtcblxuICAgIF90aGlzLmZsdXNoID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgIGlmIChfYnVmbGVuID4gMCkge1xuICAgICAgICB3cml0ZUVuY29kZWQoX2J1ZmZlciA8PCAoNiAtIF9idWZsZW4pICk7XG4gICAgICAgIF9idWZmZXIgPSAwO1xuICAgICAgICBfYnVmbGVuID0gMDtcbiAgICAgIH1cblxuICAgICAgaWYgKF9sZW5ndGggJSAzICE9IDApIHtcbiAgICAgICAgLy8gcGFkZGluZ1xuICAgICAgICB2YXIgcGFkbGVuID0gMyAtIF9sZW5ndGggJSAzO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhZGxlbjsgaSArPSAxKSB7XG4gICAgICAgICAgX2Jhc2U2NCArPSAnPSc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgX3RoaXMudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfYmFzZTY0O1xuICAgIH07XG5cbiAgICByZXR1cm4gX3RoaXM7XG4gIH07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gYmFzZTY0RGVjb2RlSW5wdXRTdHJlYW1cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICB2YXIgYmFzZTY0RGVjb2RlSW5wdXRTdHJlYW0gPSBmdW5jdGlvbihzdHIpIHtcblxuICAgIHZhciBfc3RyID0gc3RyO1xuICAgIHZhciBfcG9zID0gMDtcbiAgICB2YXIgX2J1ZmZlciA9IDA7XG4gICAgdmFyIF9idWZsZW4gPSAwO1xuXG4gICAgdmFyIF90aGlzID0ge307XG5cbiAgICBfdGhpcy5yZWFkID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgIHdoaWxlIChfYnVmbGVuIDwgOCkge1xuXG4gICAgICAgIGlmIChfcG9zID49IF9zdHIubGVuZ3RoKSB7XG4gICAgICAgICAgaWYgKF9idWZsZW4gPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aHJvdyAndW5leHBlY3RlZCBlbmQgb2YgZmlsZS4vJyArIF9idWZsZW47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYyA9IF9zdHIuY2hhckF0KF9wb3MpO1xuICAgICAgICBfcG9zICs9IDE7XG5cbiAgICAgICAgaWYgKGMgPT0gJz0nKSB7XG4gICAgICAgICAgX2J1ZmxlbiA9IDA7XG4gICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9IGVsc2UgaWYgKGMubWF0Y2goL15cXHMkLykgKSB7XG4gICAgICAgICAgLy8gaWdub3JlIGlmIHdoaXRlc3BhY2UuXG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBfYnVmZmVyID0gKF9idWZmZXIgPDwgNikgfCBkZWNvZGUoYy5jaGFyQ29kZUF0KDApICk7XG4gICAgICAgIF9idWZsZW4gKz0gNjtcbiAgICAgIH1cblxuICAgICAgdmFyIG4gPSAoX2J1ZmZlciA+Pj4gKF9idWZsZW4gLSA4KSApICYgMHhmZjtcbiAgICAgIF9idWZsZW4gLT0gODtcbiAgICAgIHJldHVybiBuO1xuICAgIH07XG5cbiAgICB2YXIgZGVjb2RlID0gZnVuY3Rpb24oYykge1xuICAgICAgaWYgKDB4NDEgPD0gYyAmJiBjIDw9IDB4NWEpIHtcbiAgICAgICAgcmV0dXJuIGMgLSAweDQxO1xuICAgICAgfSBlbHNlIGlmICgweDYxIDw9IGMgJiYgYyA8PSAweDdhKSB7XG4gICAgICAgIHJldHVybiBjIC0gMHg2MSArIDI2O1xuICAgICAgfSBlbHNlIGlmICgweDMwIDw9IGMgJiYgYyA8PSAweDM5KSB7XG4gICAgICAgIHJldHVybiBjIC0gMHgzMCArIDUyO1xuICAgICAgfSBlbHNlIGlmIChjID09IDB4MmIpIHtcbiAgICAgICAgcmV0dXJuIDYyO1xuICAgICAgfSBlbHNlIGlmIChjID09IDB4MmYpIHtcbiAgICAgICAgcmV0dXJuIDYzO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgJ2M6JyArIGM7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBfdGhpcztcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBnaWZJbWFnZSAoQi9XKVxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHZhciBnaWZJbWFnZSA9IGZ1bmN0aW9uKHdpZHRoLCBoZWlnaHQpIHtcblxuICAgIHZhciBfd2lkdGggPSB3aWR0aDtcbiAgICB2YXIgX2hlaWdodCA9IGhlaWdodDtcbiAgICB2YXIgX2RhdGEgPSBuZXcgQXJyYXkod2lkdGggKiBoZWlnaHQpO1xuXG4gICAgdmFyIF90aGlzID0ge307XG5cbiAgICBfdGhpcy5zZXRQaXhlbCA9IGZ1bmN0aW9uKHgsIHksIHBpeGVsKSB7XG4gICAgICBfZGF0YVt5ICogX3dpZHRoICsgeF0gPSBwaXhlbDtcbiAgICB9O1xuXG4gICAgX3RoaXMud3JpdGUgPSBmdW5jdGlvbihvdXQpIHtcblxuICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgIC8vIEdJRiBTaWduYXR1cmVcblxuICAgICAgb3V0LndyaXRlU3RyaW5nKCdHSUY4N2EnKTtcblxuICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgIC8vIFNjcmVlbiBEZXNjcmlwdG9yXG5cbiAgICAgIG91dC53cml0ZVNob3J0KF93aWR0aCk7XG4gICAgICBvdXQud3JpdGVTaG9ydChfaGVpZ2h0KTtcblxuICAgICAgb3V0LndyaXRlQnl0ZSgweDgwKTsgLy8gMmJpdFxuICAgICAgb3V0LndyaXRlQnl0ZSgwKTtcbiAgICAgIG91dC53cml0ZUJ5dGUoMCk7XG5cbiAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAvLyBHbG9iYWwgQ29sb3IgTWFwXG5cbiAgICAgIC8vIGJsYWNrXG4gICAgICBvdXQud3JpdGVCeXRlKDB4MDApO1xuICAgICAgb3V0LndyaXRlQnl0ZSgweDAwKTtcbiAgICAgIG91dC53cml0ZUJ5dGUoMHgwMCk7XG5cbiAgICAgIC8vIHdoaXRlXG4gICAgICBvdXQud3JpdGVCeXRlKDB4ZmYpO1xuICAgICAgb3V0LndyaXRlQnl0ZSgweGZmKTtcbiAgICAgIG91dC53cml0ZUJ5dGUoMHhmZik7XG5cbiAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAvLyBJbWFnZSBEZXNjcmlwdG9yXG5cbiAgICAgIG91dC53cml0ZVN0cmluZygnLCcpO1xuICAgICAgb3V0LndyaXRlU2hvcnQoMCk7XG4gICAgICBvdXQud3JpdGVTaG9ydCgwKTtcbiAgICAgIG91dC53cml0ZVNob3J0KF93aWR0aCk7XG4gICAgICBvdXQud3JpdGVTaG9ydChfaGVpZ2h0KTtcbiAgICAgIG91dC53cml0ZUJ5dGUoMCk7XG5cbiAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAvLyBMb2NhbCBDb2xvciBNYXBcblxuICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgIC8vIFJhc3RlciBEYXRhXG5cbiAgICAgIHZhciBsendNaW5Db2RlU2l6ZSA9IDI7XG4gICAgICB2YXIgcmFzdGVyID0gZ2V0TFpXUmFzdGVyKGx6d01pbkNvZGVTaXplKTtcblxuICAgICAgb3V0LndyaXRlQnl0ZShsendNaW5Db2RlU2l6ZSk7XG5cbiAgICAgIHZhciBvZmZzZXQgPSAwO1xuXG4gICAgICB3aGlsZSAocmFzdGVyLmxlbmd0aCAtIG9mZnNldCA+IDI1NSkge1xuICAgICAgICBvdXQud3JpdGVCeXRlKDI1NSk7XG4gICAgICAgIG91dC53cml0ZUJ5dGVzKHJhc3Rlciwgb2Zmc2V0LCAyNTUpO1xuICAgICAgICBvZmZzZXQgKz0gMjU1O1xuICAgICAgfVxuXG4gICAgICBvdXQud3JpdGVCeXRlKHJhc3Rlci5sZW5ndGggLSBvZmZzZXQpO1xuICAgICAgb3V0LndyaXRlQnl0ZXMocmFzdGVyLCBvZmZzZXQsIHJhc3Rlci5sZW5ndGggLSBvZmZzZXQpO1xuICAgICAgb3V0LndyaXRlQnl0ZSgweDAwKTtcblxuICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgIC8vIEdJRiBUZXJtaW5hdG9yXG4gICAgICBvdXQud3JpdGVTdHJpbmcoJzsnKTtcbiAgICB9O1xuXG4gICAgdmFyIGJpdE91dHB1dFN0cmVhbSA9IGZ1bmN0aW9uKG91dCkge1xuXG4gICAgICB2YXIgX291dCA9IG91dDtcbiAgICAgIHZhciBfYml0TGVuZ3RoID0gMDtcbiAgICAgIHZhciBfYml0QnVmZmVyID0gMDtcblxuICAgICAgdmFyIF90aGlzID0ge307XG5cbiAgICAgIF90aGlzLndyaXRlID0gZnVuY3Rpb24oZGF0YSwgbGVuZ3RoKSB7XG5cbiAgICAgICAgaWYgKCAoZGF0YSA+Pj4gbGVuZ3RoKSAhPSAwKSB7XG4gICAgICAgICAgdGhyb3cgJ2xlbmd0aCBvdmVyJztcbiAgICAgICAgfVxuXG4gICAgICAgIHdoaWxlIChfYml0TGVuZ3RoICsgbGVuZ3RoID49IDgpIHtcbiAgICAgICAgICBfb3V0LndyaXRlQnl0ZSgweGZmICYgKCAoZGF0YSA8PCBfYml0TGVuZ3RoKSB8IF9iaXRCdWZmZXIpICk7XG4gICAgICAgICAgbGVuZ3RoIC09ICg4IC0gX2JpdExlbmd0aCk7XG4gICAgICAgICAgZGF0YSA+Pj49ICg4IC0gX2JpdExlbmd0aCk7XG4gICAgICAgICAgX2JpdEJ1ZmZlciA9IDA7XG4gICAgICAgICAgX2JpdExlbmd0aCA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBfYml0QnVmZmVyID0gKGRhdGEgPDwgX2JpdExlbmd0aCkgfCBfYml0QnVmZmVyO1xuICAgICAgICBfYml0TGVuZ3RoID0gX2JpdExlbmd0aCArIGxlbmd0aDtcbiAgICAgIH07XG5cbiAgICAgIF90aGlzLmZsdXNoID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChfYml0TGVuZ3RoID4gMCkge1xuICAgICAgICAgIF9vdXQud3JpdGVCeXRlKF9iaXRCdWZmZXIpO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gX3RoaXM7XG4gICAgfTtcblxuICAgIHZhciBnZXRMWldSYXN0ZXIgPSBmdW5jdGlvbihsendNaW5Db2RlU2l6ZSkge1xuXG4gICAgICB2YXIgY2xlYXJDb2RlID0gMSA8PCBsendNaW5Db2RlU2l6ZTtcbiAgICAgIHZhciBlbmRDb2RlID0gKDEgPDwgbHp3TWluQ29kZVNpemUpICsgMTtcbiAgICAgIHZhciBiaXRMZW5ndGggPSBsendNaW5Db2RlU2l6ZSArIDE7XG5cbiAgICAgIC8vIFNldHVwIExaV1RhYmxlXG4gICAgICB2YXIgdGFibGUgPSBsendUYWJsZSgpO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNsZWFyQ29kZTsgaSArPSAxKSB7XG4gICAgICAgIHRhYmxlLmFkZChTdHJpbmcuZnJvbUNoYXJDb2RlKGkpICk7XG4gICAgICB9XG4gICAgICB0YWJsZS5hZGQoU3RyaW5nLmZyb21DaGFyQ29kZShjbGVhckNvZGUpICk7XG4gICAgICB0YWJsZS5hZGQoU3RyaW5nLmZyb21DaGFyQ29kZShlbmRDb2RlKSApO1xuXG4gICAgICB2YXIgYnl0ZU91dCA9IGJ5dGVBcnJheU91dHB1dFN0cmVhbSgpO1xuICAgICAgdmFyIGJpdE91dCA9IGJpdE91dHB1dFN0cmVhbShieXRlT3V0KTtcblxuICAgICAgLy8gY2xlYXIgY29kZVxuICAgICAgYml0T3V0LndyaXRlKGNsZWFyQ29kZSwgYml0TGVuZ3RoKTtcblxuICAgICAgdmFyIGRhdGFJbmRleCA9IDA7XG5cbiAgICAgIHZhciBzID0gU3RyaW5nLmZyb21DaGFyQ29kZShfZGF0YVtkYXRhSW5kZXhdKTtcbiAgICAgIGRhdGFJbmRleCArPSAxO1xuXG4gICAgICB3aGlsZSAoZGF0YUluZGV4IDwgX2RhdGEubGVuZ3RoKSB7XG5cbiAgICAgICAgdmFyIGMgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKF9kYXRhW2RhdGFJbmRleF0pO1xuICAgICAgICBkYXRhSW5kZXggKz0gMTtcblxuICAgICAgICBpZiAodGFibGUuY29udGFpbnMocyArIGMpICkge1xuXG4gICAgICAgICAgcyA9IHMgKyBjO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICBiaXRPdXQud3JpdGUodGFibGUuaW5kZXhPZihzKSwgYml0TGVuZ3RoKTtcblxuICAgICAgICAgIGlmICh0YWJsZS5zaXplKCkgPCAweGZmZikge1xuXG4gICAgICAgICAgICBpZiAodGFibGUuc2l6ZSgpID09ICgxIDw8IGJpdExlbmd0aCkgKSB7XG4gICAgICAgICAgICAgIGJpdExlbmd0aCArPSAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0YWJsZS5hZGQocyArIGMpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHMgPSBjO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGJpdE91dC53cml0ZSh0YWJsZS5pbmRleE9mKHMpLCBiaXRMZW5ndGgpO1xuXG4gICAgICAvLyBlbmQgY29kZVxuICAgICAgYml0T3V0LndyaXRlKGVuZENvZGUsIGJpdExlbmd0aCk7XG5cbiAgICAgIGJpdE91dC5mbHVzaCgpO1xuXG4gICAgICByZXR1cm4gYnl0ZU91dC50b0J5dGVBcnJheSgpO1xuICAgIH07XG5cbiAgICB2YXIgbHp3VGFibGUgPSBmdW5jdGlvbigpIHtcblxuICAgICAgdmFyIF9tYXAgPSB7fTtcbiAgICAgIHZhciBfc2l6ZSA9IDA7XG5cbiAgICAgIHZhciBfdGhpcyA9IHt9O1xuXG4gICAgICBfdGhpcy5hZGQgPSBmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgaWYgKF90aGlzLmNvbnRhaW5zKGtleSkgKSB7XG4gICAgICAgICAgdGhyb3cgJ2R1cCBrZXk6JyArIGtleTtcbiAgICAgICAgfVxuICAgICAgICBfbWFwW2tleV0gPSBfc2l6ZTtcbiAgICAgICAgX3NpemUgKz0gMTtcbiAgICAgIH07XG5cbiAgICAgIF90aGlzLnNpemUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF9zaXplO1xuICAgICAgfTtcblxuICAgICAgX3RoaXMuaW5kZXhPZiA9IGZ1bmN0aW9uKGtleSkge1xuICAgICAgICByZXR1cm4gX21hcFtrZXldO1xuICAgICAgfTtcblxuICAgICAgX3RoaXMuY29udGFpbnMgPSBmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBfbWFwW2tleV0gIT0gJ3VuZGVmaW5lZCc7XG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gX3RoaXM7XG4gICAgfTtcblxuICAgIHJldHVybiBfdGhpcztcbiAgfTtcblxuICB2YXIgY3JlYXRlRGF0YVVSTCA9IGZ1bmN0aW9uKHdpZHRoLCBoZWlnaHQsIGdldFBpeGVsKSB7XG4gICAgdmFyIGdpZiA9IGdpZkltYWdlKHdpZHRoLCBoZWlnaHQpO1xuICAgIGZvciAodmFyIHkgPSAwOyB5IDwgaGVpZ2h0OyB5ICs9IDEpIHtcbiAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgd2lkdGg7IHggKz0gMSkge1xuICAgICAgICBnaWYuc2V0UGl4ZWwoeCwgeSwgZ2V0UGl4ZWwoeCwgeSkgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgYiA9IGJ5dGVBcnJheU91dHB1dFN0cmVhbSgpO1xuICAgIGdpZi53cml0ZShiKTtcblxuICAgIHZhciBiYXNlNjQgPSBiYXNlNjRFbmNvZGVPdXRwdXRTdHJlYW0oKTtcbiAgICB2YXIgYnl0ZXMgPSBiLnRvQnl0ZUFycmF5KCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgYmFzZTY0LndyaXRlQnl0ZShieXRlc1tpXSk7XG4gICAgfVxuICAgIGJhc2U2NC5mbHVzaCgpO1xuXG4gICAgcmV0dXJuICdkYXRhOmltYWdlL2dpZjtiYXNlNjQsJyArIGJhc2U2NDtcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyByZXR1cm5zIHFyY29kZSBmdW5jdGlvbi5cblxuICByZXR1cm4gcXJjb2RlO1xufSgpO1xuXG4vLyBtdWx0aWJ5dGUgc3VwcG9ydFxuIWZ1bmN0aW9uKCkge1xuXG4gIHFyY29kZS5zdHJpbmdUb0J5dGVzRnVuY3NbJ1VURi04J10gPSBmdW5jdGlvbihzKSB7XG4gICAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xODcyOTQwNS9ob3ctdG8tY29udmVydC11dGY4LXN0cmluZy10by1ieXRlLWFycmF5XG4gICAgZnVuY3Rpb24gdG9VVEY4QXJyYXkoc3RyKSB7XG4gICAgICB2YXIgdXRmOCA9IFtdO1xuICAgICAgZm9yICh2YXIgaT0wOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBjaGFyY29kZSA9IHN0ci5jaGFyQ29kZUF0KGkpO1xuICAgICAgICBpZiAoY2hhcmNvZGUgPCAweDgwKSB1dGY4LnB1c2goY2hhcmNvZGUpO1xuICAgICAgICBlbHNlIGlmIChjaGFyY29kZSA8IDB4ODAwKSB7XG4gICAgICAgICAgdXRmOC5wdXNoKDB4YzAgfCAoY2hhcmNvZGUgPj4gNiksXG4gICAgICAgICAgICAgIDB4ODAgfCAoY2hhcmNvZGUgJiAweDNmKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY2hhcmNvZGUgPCAweGQ4MDAgfHwgY2hhcmNvZGUgPj0gMHhlMDAwKSB7XG4gICAgICAgICAgdXRmOC5wdXNoKDB4ZTAgfCAoY2hhcmNvZGUgPj4gMTIpLFxuICAgICAgICAgICAgICAweDgwIHwgKChjaGFyY29kZT4+NikgJiAweDNmKSxcbiAgICAgICAgICAgICAgMHg4MCB8IChjaGFyY29kZSAmIDB4M2YpKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBzdXJyb2dhdGUgcGFpclxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBpKys7XG4gICAgICAgICAgLy8gVVRGLTE2IGVuY29kZXMgMHgxMDAwMC0weDEwRkZGRiBieVxuICAgICAgICAgIC8vIHN1YnRyYWN0aW5nIDB4MTAwMDAgYW5kIHNwbGl0dGluZyB0aGVcbiAgICAgICAgICAvLyAyMCBiaXRzIG9mIDB4MC0weEZGRkZGIGludG8gdHdvIGhhbHZlc1xuICAgICAgICAgIGNoYXJjb2RlID0gMHgxMDAwMCArICgoKGNoYXJjb2RlICYgMHgzZmYpPDwxMClcbiAgICAgICAgICAgIHwgKHN0ci5jaGFyQ29kZUF0KGkpICYgMHgzZmYpKTtcbiAgICAgICAgICB1dGY4LnB1c2goMHhmMCB8IChjaGFyY29kZSA+PjE4KSxcbiAgICAgICAgICAgICAgMHg4MCB8ICgoY2hhcmNvZGU+PjEyKSAmIDB4M2YpLFxuICAgICAgICAgICAgICAweDgwIHwgKChjaGFyY29kZT4+NikgJiAweDNmKSxcbiAgICAgICAgICAgICAgMHg4MCB8IChjaGFyY29kZSAmIDB4M2YpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHV0Zjg7XG4gICAgfVxuICAgIHJldHVybiB0b1VURjhBcnJheShzKTtcbiAgfTtcblxufSgpO1xuXG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgZGVmaW5lKFtdLCBmYWN0b3J5KTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICB9XG59KGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gcXJjb2RlO1xufSkpO1xuIiwiaW1wb3J0IHsgQ29ybmVyRG90VHlwZXMgfSBmcm9tIFwiLi4vdHlwZXNcIjtcblxuZXhwb3J0IGRlZmF1bHQge1xuICBkb3Q6IFwiZG90XCIsXG4gIHNxdWFyZTogXCJzcXVhcmVcIixcbiAgaGVhcnQ6IFwiaGVhcnRcIixcbiAgc3RhcjogXCJzdGFyXCIgLy8gQWRkIHRoaXMgbGluZSBmb3IgdGhlIG5ldyB0eXBlXG59IGFzIENvcm5lckRvdFR5cGVzO1xuIiwiaW1wb3J0IHsgQ29ybmVyU3F1YXJlVHlwZXMgfSBmcm9tIFwiLi4vdHlwZXNcIjtcblxuZXhwb3J0IGRlZmF1bHQge1xuICBkb3Q6IFwiZG90XCIsXG4gIHNxdWFyZTogXCJzcXVhcmVcIixcbiAgZXh0cmFSb3VuZGVkOiBcImV4dHJhLXJvdW5kZWRcIlxufSBhcyBDb3JuZXJTcXVhcmVUeXBlcztcbiIsImltcG9ydCB7IERvdFR5cGVzIH0gZnJvbSBcIi4uL3R5cGVzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgZG90czogXCJkb3RzXCIsXG4gIHJhbmRvbURvdHM6IFwicmFuZG9tLWRvdHNcIixcbiAgcm91bmRlZDogXCJyb3VuZGVkXCIsXG4gIHZlcnRpY2FsTGluZXM6IFwidmVydGljYWwtbGluZXNcIixcbiAgaG9yaXpvbnRhbExpbmVzOiBcImhvcml6b250YWwtbGluZXNcIixcbiAgY2xhc3N5OiBcImNsYXNzeVwiLFxuICBjbGFzc3lSb3VuZGVkOiBcImNsYXNzeS1yb3VuZGVkXCIsXG4gIHNxdWFyZTogXCJzcXVhcmVcIixcbiAgZXh0cmFSb3VuZGVkOiBcImV4dHJhLXJvdW5kZWRcIlxufSBhcyBEb3RUeXBlcztcbiIsImltcG9ydCB7IERyYXdUeXBlcyB9IGZyb20gXCIuLi90eXBlc1wiO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGNhbnZhczogXCJjYW52YXNcIixcbiAgc3ZnOiBcInN2Z1wiXG59IGFzIERyYXdUeXBlcztcbiIsImltcG9ydCB7IEVycm9yQ29ycmVjdGlvbkxldmVsIH0gZnJvbSBcIi4uL3R5cGVzXCI7XG5cbmludGVyZmFjZSBFcnJvckNvcnJlY3Rpb25MZXZlbHMge1xuICBba2V5OiBzdHJpbmddOiBFcnJvckNvcnJlY3Rpb25MZXZlbDtcbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuICBMOiBcIkxcIixcbiAgTTogXCJNXCIsXG4gIFE6IFwiUVwiLFxuICBIOiBcIkhcIlxufSBhcyBFcnJvckNvcnJlY3Rpb25MZXZlbHM7XG4iLCJpbnRlcmZhY2UgRXJyb3JDb3JyZWN0aW9uUGVyY2VudHMge1xuICBba2V5OiBzdHJpbmddOiBudW1iZXI7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgTDogMC4wNyxcbiAgTTogMC4xNSxcbiAgUTogMC4yNSxcbiAgSDogMC4zXG59IGFzIEVycm9yQ29ycmVjdGlvblBlcmNlbnRzO1xuIiwiaW1wb3J0IHsgR3JhZGllbnRUeXBlcyB9IGZyb20gXCIuLi90eXBlc1wiO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHJhZGlhbDogXCJyYWRpYWxcIixcbiAgbGluZWFyOiBcImxpbmVhclwiXG59IGFzIEdyYWRpZW50VHlwZXM7XG4iLCJpbXBvcnQgeyBNb2RlIH0gZnJvbSBcIi4uL3R5cGVzXCI7XG5cbmludGVyZmFjZSBNb2RlcyB7XG4gIFtrZXk6IHN0cmluZ106IE1vZGU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgbnVtZXJpYzogXCJOdW1lcmljXCIsXG4gIGFscGhhbnVtZXJpYzogXCJBbHBoYW51bWVyaWNcIixcbiAgYnl0ZTogXCJCeXRlXCIsXG4gIGthbmppOiBcIkthbmppXCJcbn0gYXMgTW9kZXM7XG4iLCJpbXBvcnQgeyBUeXBlTnVtYmVyIH0gZnJvbSBcIi4uL3R5cGVzXCI7XG5cbmludGVyZmFjZSBUeXBlc01hcCB7XG4gIFtrZXk6IG51bWJlcl06IFR5cGVOdW1iZXI7XG59XG5cbmNvbnN0IHFyVHlwZXM6IFR5cGVzTWFwID0ge307XG5cbmZvciAobGV0IHR5cGUgPSAwOyB0eXBlIDw9IDQwOyB0eXBlKyspIHtcbiAgcXJUeXBlc1t0eXBlXSA9IHR5cGUgYXMgVHlwZU51bWJlcjtcbn1cblxuLy8gMCB0eXBlcyBpcyBhdXRvZGV0ZWN0XG5cbi8vIHR5cGVzID0ge1xuLy8gICAgIDA6IDAsXG4vLyAgICAgMTogMSxcbi8vICAgICAuLi5cbi8vICAgICA0MDogNDBcbi8vIH1cblxuZXhwb3J0IGRlZmF1bHQgcXJUeXBlcztcbiIsImltcG9ydCB7IFNoYXBlVHlwZXMgfSBmcm9tIFwiLi4vdHlwZXNcIjtcblxuZXhwb3J0IGRlZmF1bHQge1xuICBzcXVhcmU6IFwic3F1YXJlXCIsXG4gIGNpcmNsZTogXCJjaXJjbGVcIlxufSBhcyBTaGFwZVR5cGVzO1xuIiwiaW1wb3J0IGdldE1vZGUgZnJvbSBcIi4uL3Rvb2xzL2dldE1vZGVcIjtcbmltcG9ydCBtZXJnZURlZXAgZnJvbSBcIi4uL3Rvb2xzL21lcmdlXCI7XG5pbXBvcnQgZG93bmxvYWRVUkkgZnJvbSBcIi4uL3Rvb2xzL2Rvd25sb2FkVVJJXCI7XG5pbXBvcnQgUVJTVkcgZnJvbSBcIi4vUVJTVkdcIjtcbmltcG9ydCBkcmF3VHlwZXMgZnJvbSBcIi4uL2NvbnN0YW50cy9kcmF3VHlwZXNcIjtcblxuaW1wb3J0IGRlZmF1bHRPcHRpb25zLCB7IFJlcXVpcmVkT3B0aW9ucyB9IGZyb20gXCIuL1FST3B0aW9uc1wiO1xuaW1wb3J0IHNhbml0aXplT3B0aW9ucyBmcm9tIFwiLi4vdG9vbHMvc2FuaXRpemVPcHRpb25zXCI7XG5pbXBvcnQgeyBGaWxlRXh0ZW5zaW9uLCBRUkNvZGUsIE9wdGlvbnMsIERvd25sb2FkT3B0aW9ucywgRXh0ZW5zaW9uRnVuY3Rpb24gfSBmcm9tIFwiLi4vdHlwZXNcIjtcbmltcG9ydCBxcmNvZGUgZnJvbSBcInFyY29kZS1nZW5lcmF0b3JcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUVJDb2RlU3R5bGluZyB7XG4gIF9vcHRpb25zOiBSZXF1aXJlZE9wdGlvbnM7XG4gIF9jb250YWluZXI/OiBIVE1MRWxlbWVudDtcbiAgX2NhbnZhcz86IEhUTUxDYW52YXNFbGVtZW50O1xuICBfc3ZnPzogU1ZHRWxlbWVudDtcbiAgX3FyPzogUVJDb2RlO1xuICBfZXh0ZW5zaW9uPzogRXh0ZW5zaW9uRnVuY3Rpb247XG4gIF9jYW52YXNEcmF3aW5nUHJvbWlzZT86IFByb21pc2U8dm9pZD47XG4gIF9zdmdEcmF3aW5nUHJvbWlzZT86IFByb21pc2U8dm9pZD47XG5cbiAgY29uc3RydWN0b3Iob3B0aW9ucz86IFBhcnRpYWw8T3B0aW9ucz4pIHtcbiAgICB0aGlzLl9vcHRpb25zID0gb3B0aW9ucyA/IHNhbml0aXplT3B0aW9ucyhtZXJnZURlZXAoZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpIGFzIFJlcXVpcmVkT3B0aW9ucykgOiBkZWZhdWx0T3B0aW9ucztcbiAgICB0aGlzLnVwZGF0ZSgpO1xuICB9XG5cbiAgc3RhdGljIF9jbGVhckNvbnRhaW5lcihjb250YWluZXI/OiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICAgIGlmIChjb250YWluZXIpIHtcbiAgICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSBcIlwiO1xuICAgIH1cbiAgfVxuXG4gIF9zZXR1cFN2ZygpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX3FyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHFyU1ZHID0gbmV3IFFSU1ZHKHRoaXMuX29wdGlvbnMpO1xuXG4gICAgdGhpcy5fc3ZnID0gcXJTVkcuZ2V0RWxlbWVudCgpO1xuICAgIHRoaXMuX3N2Z0RyYXdpbmdQcm9taXNlID0gcXJTVkcuZHJhd1FSKHRoaXMuX3FyKS50aGVuKCgpID0+IHtcbiAgICAgIGlmICghdGhpcy5fc3ZnKSByZXR1cm47XG4gICAgICB0aGlzLl9leHRlbnNpb24/LihxclNWRy5nZXRFbGVtZW50KCksIHRoaXMuX29wdGlvbnMpO1xuICAgIH0pO1xuICB9XG5cbiAgX3NldHVwQ2FudmFzKCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5fcXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuICAgIHRoaXMuX2NhbnZhcy53aWR0aCA9IHRoaXMuX29wdGlvbnMud2lkdGg7XG4gICAgdGhpcy5fY2FudmFzLmhlaWdodCA9IHRoaXMuX29wdGlvbnMuaGVpZ2h0O1xuXG4gICAgdGhpcy5fc2V0dXBTdmcoKTtcbiAgICB0aGlzLl9jYW52YXNEcmF3aW5nUHJvbWlzZSA9IHRoaXMuX3N2Z0RyYXdpbmdQcm9taXNlPy50aGVuKCgpID0+IHtcbiAgICAgIGlmICghdGhpcy5fc3ZnKSByZXR1cm47XG5cbiAgICAgIGNvbnN0IHN2ZyA9IHRoaXMuX3N2ZztcbiAgICAgIGNvbnN0IHhtbCA9IG5ldyBYTUxTZXJpYWxpemVyKCkuc2VyaWFsaXplVG9TdHJpbmcoc3ZnKTtcbiAgICAgIGNvbnN0IHN2ZzY0ID0gYnRvYSh4bWwpO1xuICAgICAgY29uc3QgaW1hZ2U2NCA9IFwiZGF0YTppbWFnZS9zdmcreG1sO2Jhc2U2NCxcIiArIHN2ZzY0O1xuICAgICAgY29uc3QgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcblxuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGltYWdlLm9ubG9hZCA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgICB0aGlzLl9jYW52YXM/LmdldENvbnRleHQoXCIyZFwiKT8uZHJhd0ltYWdlKGltYWdlLCAwLCAwKTtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgaW1hZ2Uuc3JjID0gaW1hZ2U2NDtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgX2dldEVsZW1lbnQoZXh0ZW5zaW9uOiBGaWxlRXh0ZW5zaW9uID0gXCJwbmdcIik6IFByb21pc2U8U1ZHRWxlbWVudCB8IEhUTUxDYW52YXNFbGVtZW50IHwgdW5kZWZpbmVkPiB7XG4gICAgaWYgKCF0aGlzLl9xcikgdGhyb3cgXCJRUiBjb2RlIGlzIGVtcHR5XCI7XG5cbiAgICBpZiAoZXh0ZW5zaW9uLnRvTG93ZXJDYXNlKCkgPT09IFwic3ZnXCIpIHtcbiAgICAgIGlmICghdGhpcy5fc3ZnIHx8ICF0aGlzLl9zdmdEcmF3aW5nUHJvbWlzZSkge1xuICAgICAgICB0aGlzLl9zZXR1cFN2ZygpO1xuICAgICAgfVxuICAgICAgYXdhaXQgdGhpcy5fc3ZnRHJhd2luZ1Byb21pc2U7XG4gICAgICByZXR1cm4gdGhpcy5fc3ZnO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIXRoaXMuX2NhbnZhcyB8fCAhdGhpcy5fY2FudmFzRHJhd2luZ1Byb21pc2UpIHtcbiAgICAgICAgdGhpcy5fc2V0dXBDYW52YXMoKTtcbiAgICAgIH1cbiAgICAgIGF3YWl0IHRoaXMuX2NhbnZhc0RyYXdpbmdQcm9taXNlO1xuICAgICAgcmV0dXJuIHRoaXMuX2NhbnZhcztcbiAgICB9XG4gIH1cblxuICB1cGRhdGUob3B0aW9ucz86IFBhcnRpYWw8T3B0aW9ucz4pOiB2b2lkIHtcbiAgICBRUkNvZGVTdHlsaW5nLl9jbGVhckNvbnRhaW5lcih0aGlzLl9jb250YWluZXIpO1xuICAgIHRoaXMuX29wdGlvbnMgPSBvcHRpb25zID8gc2FuaXRpemVPcHRpb25zKG1lcmdlRGVlcCh0aGlzLl9vcHRpb25zLCBvcHRpb25zKSBhcyBSZXF1aXJlZE9wdGlvbnMpIDogdGhpcy5fb3B0aW9ucztcblxuICAgIGlmICghdGhpcy5fb3B0aW9ucy5kYXRhKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fcXIgPSBxcmNvZGUodGhpcy5fb3B0aW9ucy5xck9wdGlvbnMudHlwZU51bWJlciwgdGhpcy5fb3B0aW9ucy5xck9wdGlvbnMuZXJyb3JDb3JyZWN0aW9uTGV2ZWwpO1xuICAgIHRoaXMuX3FyLmFkZERhdGEodGhpcy5fb3B0aW9ucy5kYXRhLCB0aGlzLl9vcHRpb25zLnFyT3B0aW9ucy5tb2RlIHx8IGdldE1vZGUodGhpcy5fb3B0aW9ucy5kYXRhKSk7XG4gICAgdGhpcy5fcXIubWFrZSgpO1xuXG4gICAgaWYgKHRoaXMuX29wdGlvbnMudHlwZSA9PT0gZHJhd1R5cGVzLmNhbnZhcykge1xuICAgICAgdGhpcy5fc2V0dXBDYW52YXMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fc2V0dXBTdmcoKTtcbiAgICB9XG5cbiAgICB0aGlzLmFwcGVuZCh0aGlzLl9jb250YWluZXIpO1xuICB9XG5cbiAgYXBwZW5kKGNvbnRhaW5lcj86IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgaWYgKCFjb250YWluZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGNvbnRhaW5lci5hcHBlbmRDaGlsZCAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICB0aHJvdyBcIkNvbnRhaW5lciBzaG91bGQgYmUgYSBzaW5nbGUgRE9NIG5vZGVcIjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fb3B0aW9ucy50eXBlID09PSBkcmF3VHlwZXMuY2FudmFzKSB7XG4gICAgICBpZiAodGhpcy5fY2FudmFzKSB7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLl9jYW52YXMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5fc3ZnKSB7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLl9zdmcpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX2NvbnRhaW5lciA9IGNvbnRhaW5lcjtcbiAgfVxuXG4gIGFwcGx5RXh0ZW5zaW9uKGV4dGVuc2lvbjogRXh0ZW5zaW9uRnVuY3Rpb24pOiB2b2lkIHtcbiAgICBpZiAoIWV4dGVuc2lvbikge1xuICAgICAgdGhyb3cgXCJFeHRlbnNpb24gZnVuY3Rpb24gc2hvdWxkIGJlIGRlZmluZWQuXCI7XG4gICAgfVxuXG4gICAgdGhpcy5fZXh0ZW5zaW9uID0gZXh0ZW5zaW9uO1xuICAgIHRoaXMudXBkYXRlKCk7XG4gIH1cblxuICBkZWxldGVFeHRlbnNpb24oKTogdm9pZCB7XG4gICAgdGhpcy5fZXh0ZW5zaW9uID0gdW5kZWZpbmVkO1xuICAgIHRoaXMudXBkYXRlKCk7XG4gIH1cblxuICBhc3luYyBnZXRSYXdEYXRhKGV4dGVuc2lvbjogRmlsZUV4dGVuc2lvbiA9IFwicG5nXCIpOiBQcm9taXNlPEJsb2IgfCBudWxsPiB7XG4gICAgaWYgKCF0aGlzLl9xcikgdGhyb3cgXCJRUiBjb2RlIGlzIGVtcHR5XCI7XG4gICAgY29uc3QgZWxlbWVudCA9IGF3YWl0IHRoaXMuX2dldEVsZW1lbnQoZXh0ZW5zaW9uKTtcblxuICAgIGlmICghZWxlbWVudCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKGV4dGVuc2lvbi50b0xvd2VyQ2FzZSgpID09PSBcInN2Z1wiKSB7XG4gICAgICBjb25zdCBzZXJpYWxpemVyID0gbmV3IFhNTFNlcmlhbGl6ZXIoKTtcbiAgICAgIGNvbnN0IHNvdXJjZSA9IHNlcmlhbGl6ZXIuc2VyaWFsaXplVG9TdHJpbmcoZWxlbWVudCk7XG5cbiAgICAgIHJldHVybiBuZXcgQmxvYihbJzw/eG1sIHZlcnNpb249XCIxLjBcIiBzdGFuZGFsb25lPVwibm9cIj8+XFxyXFxuJyArIHNvdXJjZV0sIHsgdHlwZTogXCJpbWFnZS9zdmcreG1sXCIgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gKGVsZW1lbnQgYXMgSFRNTENhbnZhc0VsZW1lbnQpLnRvQmxvYihyZXNvbHZlLCBgaW1hZ2UvJHtleHRlbnNpb259YCwgMSkpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGRvd25sb2FkKGRvd25sb2FkT3B0aW9ucz86IFBhcnRpYWw8RG93bmxvYWRPcHRpb25zPiB8IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghdGhpcy5fcXIpIHRocm93IFwiUVIgY29kZSBpcyBlbXB0eVwiO1xuICAgIGxldCBleHRlbnNpb24gPSBcInBuZ1wiIGFzIEZpbGVFeHRlbnNpb247XG4gICAgbGV0IG5hbWUgPSBcInFyXCI7XG5cbiAgICAvL1RPRE8gcmVtb3ZlIGRlcHJlY2F0ZWQgY29kZSBpbiB0aGUgdjJcbiAgICBpZiAodHlwZW9mIGRvd25sb2FkT3B0aW9ucyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgZXh0ZW5zaW9uID0gZG93bmxvYWRPcHRpb25zIGFzIEZpbGVFeHRlbnNpb247XG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgIFwiRXh0ZW5zaW9uIGlzIGRlcHJlY2F0ZWQgYXMgYXJndW1lbnQgZm9yICdkb3dubG9hZCcgbWV0aG9kLCBwbGVhc2UgcGFzcyBvYmplY3QgeyBuYW1lOiAnLi4uJywgZXh0ZW5zaW9uOiAnLi4uJyB9IGFzIGFyZ3VtZW50XCJcbiAgICAgICk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZG93bmxvYWRPcHRpb25zID09PSBcIm9iamVjdFwiICYmIGRvd25sb2FkT3B0aW9ucyAhPT0gbnVsbCkge1xuICAgICAgaWYgKGRvd25sb2FkT3B0aW9ucy5uYW1lKSB7XG4gICAgICAgIG5hbWUgPSBkb3dubG9hZE9wdGlvbnMubmFtZTtcbiAgICAgIH1cbiAgICAgIGlmIChkb3dubG9hZE9wdGlvbnMuZXh0ZW5zaW9uKSB7XG4gICAgICAgIGV4dGVuc2lvbiA9IGRvd25sb2FkT3B0aW9ucy5leHRlbnNpb247XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgZWxlbWVudCA9IGF3YWl0IHRoaXMuX2dldEVsZW1lbnQoZXh0ZW5zaW9uKTtcblxuICAgIGlmICghZWxlbWVudCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChleHRlbnNpb24udG9Mb3dlckNhc2UoKSA9PT0gXCJzdmdcIikge1xuICAgICAgY29uc3Qgc2VyaWFsaXplciA9IG5ldyBYTUxTZXJpYWxpemVyKCk7XG4gICAgICBsZXQgc291cmNlID0gc2VyaWFsaXplci5zZXJpYWxpemVUb1N0cmluZyhlbGVtZW50KTtcblxuICAgICAgc291cmNlID0gJzw/eG1sIHZlcnNpb249XCIxLjBcIiBzdGFuZGFsb25lPVwibm9cIj8+XFxyXFxuJyArIHNvdXJjZTtcbiAgICAgIGNvbnN0IHVybCA9IFwiZGF0YTppbWFnZS9zdmcreG1sO2NoYXJzZXQ9dXRmLTgsXCIgKyBlbmNvZGVVUklDb21wb25lbnQoc291cmNlKTtcbiAgICAgIGRvd25sb2FkVVJJKHVybCwgYCR7bmFtZX0uc3ZnYCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHVybCA9IChlbGVtZW50IGFzIEhUTUxDYW52YXNFbGVtZW50KS50b0RhdGFVUkwoYGltYWdlLyR7ZXh0ZW5zaW9ufWApO1xuICAgICAgZG93bmxvYWRVUkkodXJsLCBgJHtuYW1lfS4ke2V4dGVuc2lvbn1gKTtcbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCBxclR5cGVzIGZyb20gXCIuLi9jb25zdGFudHMvcXJUeXBlc1wiO1xuaW1wb3J0IGRyYXdUeXBlcyBmcm9tIFwiLi4vY29uc3RhbnRzL2RyYXdUeXBlc1wiO1xuaW1wb3J0IHNoYXBlVHlwZXMgZnJvbSBcIi4uL2NvbnN0YW50cy9zaGFwZVR5cGVzXCI7XG5pbXBvcnQgZXJyb3JDb3JyZWN0aW9uTGV2ZWxzIGZyb20gXCIuLi9jb25zdGFudHMvZXJyb3JDb3JyZWN0aW9uTGV2ZWxzXCI7XG5pbXBvcnQgeyBTaGFwZVR5cGUsIERvdFR5cGUsIE9wdGlvbnMsIFR5cGVOdW1iZXIsIEVycm9yQ29ycmVjdGlvbkxldmVsLCBNb2RlLCBEcmF3VHlwZSwgR3JhZGllbnQgfSBmcm9tIFwiLi4vdHlwZXNcIjtcblxuZXhwb3J0IGludGVyZmFjZSBSZXF1aXJlZE9wdGlvbnMgZXh0ZW5kcyBPcHRpb25zIHtcbiAgdHlwZTogRHJhd1R5cGU7XG4gIHNoYXBlOiBTaGFwZVR5cGU7XG4gIHdpZHRoOiBudW1iZXI7XG4gIGhlaWdodDogbnVtYmVyO1xuICBtYXJnaW46IG51bWJlcjtcbiAgZGF0YTogc3RyaW5nO1xuICBxck9wdGlvbnM6IHtcbiAgICB0eXBlTnVtYmVyOiBUeXBlTnVtYmVyO1xuICAgIG1vZGU/OiBNb2RlO1xuICAgIGVycm9yQ29ycmVjdGlvbkxldmVsOiBFcnJvckNvcnJlY3Rpb25MZXZlbDtcbiAgfTtcbiAgaW1hZ2VPcHRpb25zOiB7XG4gICAgaGlkZUJhY2tncm91bmREb3RzOiBib29sZWFuO1xuICAgIGltYWdlU2l6ZTogbnVtYmVyO1xuICAgIGNyb3NzT3JpZ2luPzogc3RyaW5nO1xuICAgIG1hcmdpbjogbnVtYmVyO1xuICB9O1xuICBkb3RzT3B0aW9uczoge1xuICAgIHR5cGU6IERvdFR5cGU7XG4gICAgY29sb3I6IHN0cmluZztcbiAgICBncmFkaWVudD86IEdyYWRpZW50O1xuICB9O1xuICBiYWNrZ3JvdW5kT3B0aW9uczoge1xuICAgIHJvdW5kOiBudW1iZXI7XG4gICAgY29sb3I6IHN0cmluZztcbiAgICBncmFkaWVudD86IEdyYWRpZW50O1xuICB9O1xufVxuXG5jb25zdCBkZWZhdWx0T3B0aW9uczogUmVxdWlyZWRPcHRpb25zID0ge1xuICB0eXBlOiBkcmF3VHlwZXMuY2FudmFzLFxuICBzaGFwZTogc2hhcGVUeXBlcy5zcXVhcmUsXG4gIHdpZHRoOiAzMDAsXG4gIGhlaWdodDogMzAwLFxuICBkYXRhOiBcIlwiLFxuICBtYXJnaW46IDAsXG4gIHFyT3B0aW9uczoge1xuICAgIHR5cGVOdW1iZXI6IHFyVHlwZXNbMF0sXG4gICAgbW9kZTogdW5kZWZpbmVkLFxuICAgIGVycm9yQ29ycmVjdGlvbkxldmVsOiBlcnJvckNvcnJlY3Rpb25MZXZlbHMuUVxuICB9LFxuICBpbWFnZU9wdGlvbnM6IHtcbiAgICBoaWRlQmFja2dyb3VuZERvdHM6IHRydWUsXG4gICAgaW1hZ2VTaXplOiAwLjQsXG4gICAgY3Jvc3NPcmlnaW46IHVuZGVmaW5lZCxcbiAgICBtYXJnaW46IDBcbiAgfSxcbiAgZG90c09wdGlvbnM6IHtcbiAgICB0eXBlOiBcInNxdWFyZVwiLFxuICAgIGNvbG9yOiBcIiMwMDBcIlxuICB9LFxuICBiYWNrZ3JvdW5kT3B0aW9uczoge1xuICAgIHJvdW5kOiAwLFxuICAgIGNvbG9yOiBcIiNmZmZcIlxuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBkZWZhdWx0T3B0aW9ucztcbiIsImltcG9ydCBjYWxjdWxhdGVJbWFnZVNpemUgZnJvbSBcIi4uL3Rvb2xzL2NhbGN1bGF0ZUltYWdlU2l6ZVwiO1xuaW1wb3J0IHRvRGF0YVVybCBmcm9tIFwiLi4vdG9vbHMvdG9EYXRhVXJsXCI7XG5pbXBvcnQgZXJyb3JDb3JyZWN0aW9uUGVyY2VudHMgZnJvbSBcIi4uL2NvbnN0YW50cy9lcnJvckNvcnJlY3Rpb25QZXJjZW50c1wiO1xuaW1wb3J0IFFSRG90IGZyb20gXCIuLi9maWd1cmVzL2RvdC9RUkRvdFwiO1xuaW1wb3J0IFFSQ29ybmVyU3F1YXJlIGZyb20gXCIuLi9maWd1cmVzL2Nvcm5lclNxdWFyZS9RUkNvcm5lclNxdWFyZVwiO1xuaW1wb3J0IFFSQ29ybmVyRG90IGZyb20gXCIuLi9maWd1cmVzL2Nvcm5lckRvdC9RUkNvcm5lckRvdFwiO1xuaW1wb3J0IHsgUmVxdWlyZWRPcHRpb25zIH0gZnJvbSBcIi4vUVJPcHRpb25zXCI7XG5pbXBvcnQgZ3JhZGllbnRUeXBlcyBmcm9tIFwiLi4vY29uc3RhbnRzL2dyYWRpZW50VHlwZXNcIjtcbmltcG9ydCBzaGFwZVR5cGVzIGZyb20gXCIuLi9jb25zdGFudHMvc2hhcGVUeXBlc1wiO1xuaW1wb3J0IHsgUVJDb2RlLCBGaWx0ZXJGdW5jdGlvbiwgR3JhZGllbnQgfSBmcm9tIFwiLi4vdHlwZXNcIjtcblxuY29uc3Qgc3F1YXJlTWFzayA9IFtcbiAgWzEsIDEsIDEsIDEsIDEsIDEsIDFdLFxuICBbMSwgMCwgMCwgMCwgMCwgMCwgMV0sXG4gIFsxLCAwLCAwLCAwLCAwLCAwLCAxXSxcbiAgWzEsIDAsIDAsIDAsIDAsIDAsIDFdLFxuICBbMSwgMCwgMCwgMCwgMCwgMCwgMV0sXG4gIFsxLCAwLCAwLCAwLCAwLCAwLCAxXSxcbiAgWzEsIDEsIDEsIDEsIDEsIDEsIDFdXG5dO1xuXG5jb25zdCBkb3RNYXNrID0gW1xuICBbMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gIFswLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgWzAsIDAsIDEsIDEsIDEsIDAsIDBdLFxuICBbMCwgMCwgMSwgMSwgMSwgMCwgMF0sXG4gIFswLCAwLCAxLCAxLCAxLCAwLCAwXSxcbiAgWzAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICBbMCwgMCwgMCwgMCwgMCwgMCwgMF1cbl07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFFSU1ZHIHtcbiAgX2VsZW1lbnQ6IFNWR0VsZW1lbnQ7XG4gIF9kZWZzOiBTVkdFbGVtZW50O1xuICBfYmFja2dyb3VuZENsaXBQYXRoPzogU1ZHRWxlbWVudDtcbiAgX2RvdHNDbGlwUGF0aD86IFNWR0VsZW1lbnQ7XG4gIF9jb3JuZXJzU3F1YXJlQ2xpcFBhdGg/OiBTVkdFbGVtZW50O1xuICBfY29ybmVyc0RvdENsaXBQYXRoPzogU1ZHRWxlbWVudDtcbiAgX29wdGlvbnM6IFJlcXVpcmVkT3B0aW9ucztcbiAgX3FyPzogUVJDb2RlO1xuICBfaW1hZ2U/OiBIVE1MSW1hZ2VFbGVtZW50O1xuXG4gIC8vVE9ETyBkb24ndCBwYXNzIGFsbCBvcHRpb25zIHRvIHRoaXMgY2xhc3NcbiAgY29uc3RydWN0b3Iob3B0aW9uczogUmVxdWlyZWRPcHRpb25zKSB7XG4gICAgdGhpcy5fZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwic3ZnXCIpO1xuICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKFwid2lkdGhcIiwgU3RyaW5nKG9wdGlvbnMud2lkdGgpKTtcbiAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShcImhlaWdodFwiLCBTdHJpbmcob3B0aW9ucy5oZWlnaHQpKTtcbiAgICB0aGlzLl9kZWZzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJkZWZzXCIpO1xuICAgIHRoaXMuX2VsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5fZGVmcyk7XG5cbiAgICB0aGlzLl9vcHRpb25zID0gb3B0aW9ucztcbiAgfVxuXG4gIGdldCB3aWR0aCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9vcHRpb25zLndpZHRoO1xuICB9XG5cbiAgZ2V0IGhlaWdodCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9vcHRpb25zLmhlaWdodDtcbiAgfVxuXG4gIGdldEVsZW1lbnQoKTogU1ZHRWxlbWVudCB7XG4gICAgcmV0dXJuIHRoaXMuX2VsZW1lbnQ7XG4gIH1cblxuICBhc3luYyBkcmF3UVIocXI6IFFSQ29kZSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGNvdW50ID0gcXIuZ2V0TW9kdWxlQ291bnQoKTtcbiAgICBjb25zdCBtaW5TaXplID0gTWF0aC5taW4odGhpcy5fb3B0aW9ucy53aWR0aCwgdGhpcy5fb3B0aW9ucy5oZWlnaHQpIC0gdGhpcy5fb3B0aW9ucy5tYXJnaW4gKiAyO1xuICAgIGNvbnN0IHJlYWxRUlNpemUgPSB0aGlzLl9vcHRpb25zLnNoYXBlID09PSBzaGFwZVR5cGVzLmNpcmNsZSA/IG1pblNpemUgLyBNYXRoLnNxcnQoMikgOiBtaW5TaXplO1xuICAgIGNvbnN0IGRvdFNpemUgPSBNYXRoLmZsb29yKHJlYWxRUlNpemUgLyBjb3VudCk7XG4gICAgbGV0IGRyYXdJbWFnZVNpemUgPSB7XG4gICAgICBoaWRlWERvdHM6IDAsXG4gICAgICBoaWRlWURvdHM6IDAsXG4gICAgICB3aWR0aDogMCxcbiAgICAgIGhlaWdodDogMFxuICAgIH07XG5cbiAgICB0aGlzLl9xciA9IHFyO1xuXG4gICAgaWYgKHRoaXMuX29wdGlvbnMuaW1hZ2UpIHtcbiAgICAgIC8vV2UgbmVlZCBpdCB0byBnZXQgaW1hZ2Ugc2l6ZVxuICAgICAgYXdhaXQgdGhpcy5sb2FkSW1hZ2UoKTtcbiAgICAgIGlmICghdGhpcy5faW1hZ2UpIHJldHVybjtcbiAgICAgIGNvbnN0IHsgaW1hZ2VPcHRpb25zLCBxck9wdGlvbnMgfSA9IHRoaXMuX29wdGlvbnM7XG4gICAgICBjb25zdCBjb3ZlckxldmVsID0gaW1hZ2VPcHRpb25zLmltYWdlU2l6ZSAqIGVycm9yQ29ycmVjdGlvblBlcmNlbnRzW3FyT3B0aW9ucy5lcnJvckNvcnJlY3Rpb25MZXZlbF07XG4gICAgICBjb25zdCBtYXhIaWRkZW5Eb3RzID0gTWF0aC5mbG9vcihjb3ZlckxldmVsICogY291bnQgKiBjb3VudCk7XG5cbiAgICAgIGRyYXdJbWFnZVNpemUgPSBjYWxjdWxhdGVJbWFnZVNpemUoe1xuICAgICAgICBvcmlnaW5hbFdpZHRoOiB0aGlzLl9pbWFnZS53aWR0aCxcbiAgICAgICAgb3JpZ2luYWxIZWlnaHQ6IHRoaXMuX2ltYWdlLmhlaWdodCxcbiAgICAgICAgbWF4SGlkZGVuRG90cyxcbiAgICAgICAgbWF4SGlkZGVuQXhpc0RvdHM6IGNvdW50IC0gMTQsXG4gICAgICAgIGRvdFNpemVcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMuZHJhd0JhY2tncm91bmQoKTtcbiAgICB0aGlzLmRyYXdEb3RzKChpOiBudW1iZXIsIGo6IG51bWJlcik6IGJvb2xlYW4gPT4ge1xuICAgICAgaWYgKHRoaXMuX29wdGlvbnMuaW1hZ2VPcHRpb25zLmhpZGVCYWNrZ3JvdW5kRG90cykge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgaSA+PSAoY291bnQgLSBkcmF3SW1hZ2VTaXplLmhpZGVYRG90cykgLyAyICYmXG4gICAgICAgICAgaSA8IChjb3VudCArIGRyYXdJbWFnZVNpemUuaGlkZVhEb3RzKSAvIDIgJiZcbiAgICAgICAgICBqID49IChjb3VudCAtIGRyYXdJbWFnZVNpemUuaGlkZVlEb3RzKSAvIDIgJiZcbiAgICAgICAgICBqIDwgKGNvdW50ICsgZHJhd0ltYWdlU2l6ZS5oaWRlWURvdHMpIC8gMlxuICAgICAgICApIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHNxdWFyZU1hc2tbaV0/LltqXSB8fCBzcXVhcmVNYXNrW2kgLSBjb3VudCArIDddPy5bal0gfHwgc3F1YXJlTWFza1tpXT8uW2ogLSBjb3VudCArIDddKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGRvdE1hc2tbaV0/LltqXSB8fCBkb3RNYXNrW2kgLSBjb3VudCArIDddPy5bal0gfHwgZG90TWFza1tpXT8uW2ogLSBjb3VudCArIDddKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gICAgdGhpcy5kcmF3Q29ybmVycygpO1xuXG4gICAgaWYgKHRoaXMuX29wdGlvbnMuaW1hZ2UpIHtcbiAgICAgIGF3YWl0IHRoaXMuZHJhd0ltYWdlKHsgd2lkdGg6IGRyYXdJbWFnZVNpemUud2lkdGgsIGhlaWdodDogZHJhd0ltYWdlU2l6ZS5oZWlnaHQsIGNvdW50LCBkb3RTaXplIH0pO1xuICAgIH1cbiAgfVxuXG4gIGRyYXdCYWNrZ3JvdW5kKCk6IHZvaWQge1xuICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLl9lbGVtZW50O1xuICAgIGNvbnN0IG9wdGlvbnMgPSB0aGlzLl9vcHRpb25zO1xuXG4gICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgIGNvbnN0IGdyYWRpZW50T3B0aW9ucyA9IG9wdGlvbnMuYmFja2dyb3VuZE9wdGlvbnM/LmdyYWRpZW50O1xuICAgICAgY29uc3QgY29sb3IgPSBvcHRpb25zLmJhY2tncm91bmRPcHRpb25zPy5jb2xvcjtcblxuICAgICAgaWYgKGdyYWRpZW50T3B0aW9ucyB8fCBjb2xvcikge1xuICAgICAgICB0aGlzLl9jcmVhdGVDb2xvcih7XG4gICAgICAgICAgb3B0aW9uczogZ3JhZGllbnRPcHRpb25zLFxuICAgICAgICAgIGNvbG9yOiBjb2xvcixcbiAgICAgICAgICBhZGRpdGlvbmFsUm90YXRpb246IDAsXG4gICAgICAgICAgeDogMCxcbiAgICAgICAgICB5OiAwLFxuICAgICAgICAgIGhlaWdodDogb3B0aW9ucy5oZWlnaHQsXG4gICAgICAgICAgd2lkdGg6IG9wdGlvbnMud2lkdGgsXG4gICAgICAgICAgbmFtZTogXCJiYWNrZ3JvdW5kLWNvbG9yXCJcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRpb25zLmJhY2tncm91bmRPcHRpb25zPy5yb3VuZCkge1xuICAgICAgICBjb25zdCBzaXplID0gTWF0aC5taW4ob3B0aW9ucy53aWR0aCwgb3B0aW9ucy5oZWlnaHQpO1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJyZWN0XCIpO1xuICAgICAgICB0aGlzLl9iYWNrZ3JvdW5kQ2xpcFBhdGggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcImNsaXBQYXRoXCIpO1xuICAgICAgICB0aGlzLl9iYWNrZ3JvdW5kQ2xpcFBhdGguc2V0QXR0cmlidXRlKFwiaWRcIiwgXCJjbGlwLXBhdGgtYmFja2dyb3VuZC1jb2xvclwiKTtcbiAgICAgICAgdGhpcy5fZGVmcy5hcHBlbmRDaGlsZCh0aGlzLl9iYWNrZ3JvdW5kQ2xpcFBhdGgpO1xuXG4gICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKFwieFwiLCBTdHJpbmcoKG9wdGlvbnMud2lkdGggLSBzaXplKSAvIDIpKTtcbiAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJ5XCIsIFN0cmluZygob3B0aW9ucy5oZWlnaHQgLSBzaXplKSAvIDIpKTtcbiAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJ3aWR0aFwiLCBTdHJpbmcoc2l6ZSkpO1xuICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShcImhlaWdodFwiLCBTdHJpbmcoc2l6ZSkpO1xuICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShcInJ4XCIsIFN0cmluZygoc2l6ZSAvIDIpICogb3B0aW9ucy5iYWNrZ3JvdW5kT3B0aW9ucy5yb3VuZCkpO1xuXG4gICAgICAgIHRoaXMuX2JhY2tncm91bmRDbGlwUGF0aC5hcHBlbmRDaGlsZChlbGVtZW50KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBkcmF3RG90cyhmaWx0ZXI/OiBGaWx0ZXJGdW5jdGlvbik6IHZvaWQge1xuICAgIGlmICghdGhpcy5fcXIpIHtcbiAgICAgIHRocm93IFwiUVIgY29kZSBpcyBub3QgZGVmaW5lZFwiO1xuICAgIH1cblxuICAgIGNvbnN0IG9wdGlvbnMgPSB0aGlzLl9vcHRpb25zO1xuICAgIGNvbnN0IGNvdW50ID0gdGhpcy5fcXIuZ2V0TW9kdWxlQ291bnQoKTtcblxuICAgIGlmIChjb3VudCA+IG9wdGlvbnMud2lkdGggfHwgY291bnQgPiBvcHRpb25zLmhlaWdodCkge1xuICAgICAgdGhyb3cgXCJUaGUgY2FudmFzIGlzIHRvbyBzbWFsbC5cIjtcbiAgICB9XG5cbiAgICBjb25zdCBtaW5TaXplID0gTWF0aC5taW4ob3B0aW9ucy53aWR0aCwgb3B0aW9ucy5oZWlnaHQpIC0gb3B0aW9ucy5tYXJnaW4gKiAyO1xuICAgIGNvbnN0IHJlYWxRUlNpemUgPSBvcHRpb25zLnNoYXBlID09PSBzaGFwZVR5cGVzLmNpcmNsZSA/IG1pblNpemUgLyBNYXRoLnNxcnQoMikgOiBtaW5TaXplO1xuICAgIGNvbnN0IGRvdFNpemUgPSBNYXRoLmZsb29yKHJlYWxRUlNpemUgLyBjb3VudCk7XG4gICAgY29uc3QgeEJlZ2lubmluZyA9IE1hdGguZmxvb3IoKG9wdGlvbnMud2lkdGggLSBjb3VudCAqIGRvdFNpemUpIC8gMik7XG4gICAgY29uc3QgeUJlZ2lubmluZyA9IE1hdGguZmxvb3IoKG9wdGlvbnMuaGVpZ2h0IC0gY291bnQgKiBkb3RTaXplKSAvIDIpO1xuICAgIGNvbnN0IGRvdCA9IG5ldyBRUkRvdCh7IHN2ZzogdGhpcy5fZWxlbWVudCwgdHlwZTogb3B0aW9ucy5kb3RzT3B0aW9ucy50eXBlIH0pO1xuXG4gICAgdGhpcy5fZG90c0NsaXBQYXRoID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJjbGlwUGF0aFwiKTtcbiAgICB0aGlzLl9kb3RzQ2xpcFBhdGguc2V0QXR0cmlidXRlKFwiaWRcIiwgXCJjbGlwLXBhdGgtZG90LWNvbG9yXCIpO1xuICAgIHRoaXMuX2RlZnMuYXBwZW5kQ2hpbGQodGhpcy5fZG90c0NsaXBQYXRoKTtcblxuICAgIHRoaXMuX2NyZWF0ZUNvbG9yKHtcbiAgICAgIG9wdGlvbnM6IG9wdGlvbnMuZG90c09wdGlvbnM/LmdyYWRpZW50LFxuICAgICAgY29sb3I6IG9wdGlvbnMuZG90c09wdGlvbnMuY29sb3IsXG4gICAgICBhZGRpdGlvbmFsUm90YXRpb246IDAsXG4gICAgICB4OiAwLFxuICAgICAgeTogMCxcbiAgICAgIGhlaWdodDogb3B0aW9ucy5oZWlnaHQsXG4gICAgICB3aWR0aDogb3B0aW9ucy53aWR0aCxcbiAgICAgIG5hbWU6IFwiZG90LWNvbG9yXCJcbiAgICB9KTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBjb3VudDsgaisrKSB7XG4gICAgICAgIGlmIChmaWx0ZXIgJiYgIWZpbHRlcihpLCBqKSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5fcXI/LmlzRGFyayhpLCBqKSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgZG90LmRyYXcoXG4gICAgICAgICAgeEJlZ2lubmluZyArIGkgKiBkb3RTaXplLFxuICAgICAgICAgIHlCZWdpbm5pbmcgKyBqICogZG90U2l6ZSxcbiAgICAgICAgICBkb3RTaXplLFxuICAgICAgICAgICh4T2Zmc2V0OiBudW1iZXIsIHlPZmZzZXQ6IG51bWJlcik6IGJvb2xlYW4gPT4ge1xuICAgICAgICAgICAgaWYgKGkgKyB4T2Zmc2V0IDwgMCB8fCBqICsgeU9mZnNldCA8IDAgfHwgaSArIHhPZmZzZXQgPj0gY291bnQgfHwgaiArIHlPZmZzZXQgPj0gY291bnQpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGlmIChmaWx0ZXIgJiYgIWZpbHRlcihpICsgeE9mZnNldCwgaiArIHlPZmZzZXQpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICByZXR1cm4gISF0aGlzLl9xciAmJiB0aGlzLl9xci5pc0RhcmsoaSArIHhPZmZzZXQsIGogKyB5T2Zmc2V0KTtcbiAgICAgICAgICB9XG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKGRvdC5fZWxlbWVudCAmJiB0aGlzLl9kb3RzQ2xpcFBhdGgpIHtcbiAgICAgICAgICB0aGlzLl9kb3RzQ2xpcFBhdGguYXBwZW5kQ2hpbGQoZG90Ll9lbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChvcHRpb25zLnNoYXBlID09PSBzaGFwZVR5cGVzLmNpcmNsZSkge1xuICAgICAgY29uc3QgYWRkaXRpb25hbERvdHMgPSBNYXRoLmZsb29yKChtaW5TaXplIC8gZG90U2l6ZSAtIGNvdW50KSAvIDIpO1xuICAgICAgY29uc3QgZmFrZUNvdW50ID0gY291bnQgKyBhZGRpdGlvbmFsRG90cyAqIDI7XG4gICAgICBjb25zdCB4RmFrZUJlZ2lubmluZyA9IHhCZWdpbm5pbmcgLSBhZGRpdGlvbmFsRG90cyAqIGRvdFNpemU7XG4gICAgICBjb25zdCB5RmFrZUJlZ2lubmluZyA9IHlCZWdpbm5pbmcgLSBhZGRpdGlvbmFsRG90cyAqIGRvdFNpemU7XG4gICAgICBjb25zdCBmYWtlTWF0cml4OiBudW1iZXJbXVtdID0gW107XG4gICAgICBjb25zdCBjZW50ZXIgPSBNYXRoLmZsb29yKGZha2VDb3VudCAvIDIpO1xuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZha2VDb3VudDsgaSsrKSB7XG4gICAgICAgIGZha2VNYXRyaXhbaV0gPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBmYWtlQ291bnQ7IGorKykge1xuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIGkgPj0gYWRkaXRpb25hbERvdHMgLSAxICYmXG4gICAgICAgICAgICBpIDw9IGZha2VDb3VudCAtIGFkZGl0aW9uYWxEb3RzICYmXG4gICAgICAgICAgICBqID49IGFkZGl0aW9uYWxEb3RzIC0gMSAmJlxuICAgICAgICAgICAgaiA8PSBmYWtlQ291bnQgLSBhZGRpdGlvbmFsRG90c1xuICAgICAgICAgICkge1xuICAgICAgICAgICAgZmFrZU1hdHJpeFtpXVtqXSA9IDA7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoTWF0aC5zcXJ0KChpIC0gY2VudGVyKSAqIChpIC0gY2VudGVyKSArIChqIC0gY2VudGVyKSAqIChqIC0gY2VudGVyKSkgPiBjZW50ZXIpIHtcbiAgICAgICAgICAgIGZha2VNYXRyaXhbaV1bal0gPSAwO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy9HZXQgcmFuZG9tIGRvdHMgZnJvbSBRUiBjb2RlIHRvIHNob3cgaXQgb3V0c2lkZSBvZiBRUiBjb2RlXG4gICAgICAgICAgZmFrZU1hdHJpeFtpXVtqXSA9IHRoaXMuX3FyLmlzRGFyayhcbiAgICAgICAgICAgIGogLSAyICogYWRkaXRpb25hbERvdHMgPCAwID8gaiA6IGogPj0gY291bnQgPyBqIC0gMiAqIGFkZGl0aW9uYWxEb3RzIDogaiAtIGFkZGl0aW9uYWxEb3RzLFxuICAgICAgICAgICAgaSAtIDIgKiBhZGRpdGlvbmFsRG90cyA8IDAgPyBpIDogaSA+PSBjb3VudCA/IGkgLSAyICogYWRkaXRpb25hbERvdHMgOiBpIC0gYWRkaXRpb25hbERvdHNcbiAgICAgICAgICApXG4gICAgICAgICAgICA/IDFcbiAgICAgICAgICAgIDogMDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZha2VDb3VudDsgaSsrKSB7XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgZmFrZUNvdW50OyBqKyspIHtcbiAgICAgICAgICBpZiAoIWZha2VNYXRyaXhbaV1bal0pIGNvbnRpbnVlO1xuXG4gICAgICAgICAgZG90LmRyYXcoXG4gICAgICAgICAgICB4RmFrZUJlZ2lubmluZyArIGkgKiBkb3RTaXplLFxuICAgICAgICAgICAgeUZha2VCZWdpbm5pbmcgKyBqICogZG90U2l6ZSxcbiAgICAgICAgICAgIGRvdFNpemUsXG4gICAgICAgICAgICAoeE9mZnNldDogbnVtYmVyLCB5T2Zmc2V0OiBudW1iZXIpOiBib29sZWFuID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuICEhZmFrZU1hdHJpeFtpICsgeE9mZnNldF0/LltqICsgeU9mZnNldF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgKTtcbiAgICAgICAgICBpZiAoZG90Ll9lbGVtZW50ICYmIHRoaXMuX2RvdHNDbGlwUGF0aCkge1xuICAgICAgICAgICAgdGhpcy5fZG90c0NsaXBQYXRoLmFwcGVuZENoaWxkKGRvdC5fZWxlbWVudCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZHJhd0Nvcm5lcnMoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9xcikge1xuICAgICAgdGhyb3cgXCJRUiBjb2RlIGlzIG5vdCBkZWZpbmVkXCI7XG4gICAgfVxuXG4gICAgY29uc3QgZWxlbWVudCA9IHRoaXMuX2VsZW1lbnQ7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHRoaXMuX29wdGlvbnM7XG5cbiAgICBpZiAoIWVsZW1lbnQpIHtcbiAgICAgIHRocm93IFwiRWxlbWVudCBjb2RlIGlzIG5vdCBkZWZpbmVkXCI7XG4gICAgfVxuXG4gICAgY29uc3QgY291bnQgPSB0aGlzLl9xci5nZXRNb2R1bGVDb3VudCgpO1xuICAgIGNvbnN0IG1pblNpemUgPSBNYXRoLm1pbihvcHRpb25zLndpZHRoLCBvcHRpb25zLmhlaWdodCkgLSBvcHRpb25zLm1hcmdpbiAqIDI7XG4gICAgY29uc3QgcmVhbFFSU2l6ZSA9IG9wdGlvbnMuc2hhcGUgPT09IHNoYXBlVHlwZXMuY2lyY2xlID8gbWluU2l6ZSAvIE1hdGguc3FydCgyKSA6IG1pblNpemU7XG4gICAgY29uc3QgZG90U2l6ZSA9IE1hdGguZmxvb3IocmVhbFFSU2l6ZSAvIGNvdW50KTtcbiAgICBjb25zdCBjb3JuZXJzU3F1YXJlU2l6ZSA9IGRvdFNpemUgKiA3O1xuICAgIGNvbnN0IGNvcm5lcnNEb3RTaXplID0gZG90U2l6ZSAqIDM7XG4gICAgY29uc3QgeEJlZ2lubmluZyA9IE1hdGguZmxvb3IoKG9wdGlvbnMud2lkdGggLSBjb3VudCAqIGRvdFNpemUpIC8gMik7XG4gICAgY29uc3QgeUJlZ2lubmluZyA9IE1hdGguZmxvb3IoKG9wdGlvbnMuaGVpZ2h0IC0gY291bnQgKiBkb3RTaXplKSAvIDIpO1xuXG4gICAgW1xuICAgICAgWzAsIDAsIDBdLFxuICAgICAgWzEsIDAsIE1hdGguUEkgLyAyXSxcbiAgICAgIFswLCAxLCAtTWF0aC5QSSAvIDJdXG4gICAgXS5mb3JFYWNoKChbY29sdW1uLCByb3csIHJvdGF0aW9uXSkgPT4ge1xuICAgICAgY29uc3QgeCA9IHhCZWdpbm5pbmcgKyBjb2x1bW4gKiBkb3RTaXplICogKGNvdW50IC0gNyk7XG4gICAgICBjb25zdCB5ID0geUJlZ2lubmluZyArIHJvdyAqIGRvdFNpemUgKiAoY291bnQgLSA3KTtcbiAgICAgIGxldCBjb3JuZXJzU3F1YXJlQ2xpcFBhdGggPSB0aGlzLl9kb3RzQ2xpcFBhdGg7XG4gICAgICBsZXQgY29ybmVyc0RvdENsaXBQYXRoID0gdGhpcy5fZG90c0NsaXBQYXRoO1xuXG4gICAgICBpZiAob3B0aW9ucy5jb3JuZXJzU3F1YXJlT3B0aW9ucz8uZ3JhZGllbnQgfHwgb3B0aW9ucy5jb3JuZXJzU3F1YXJlT3B0aW9ucz8uY29sb3IpIHtcbiAgICAgICAgY29ybmVyc1NxdWFyZUNsaXBQYXRoID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJjbGlwUGF0aFwiKTtcbiAgICAgICAgY29ybmVyc1NxdWFyZUNsaXBQYXRoLnNldEF0dHJpYnV0ZShcImlkXCIsIGBjbGlwLXBhdGgtY29ybmVycy1zcXVhcmUtY29sb3ItJHtjb2x1bW59LSR7cm93fWApO1xuICAgICAgICB0aGlzLl9kZWZzLmFwcGVuZENoaWxkKGNvcm5lcnNTcXVhcmVDbGlwUGF0aCk7XG4gICAgICAgIHRoaXMuX2Nvcm5lcnNTcXVhcmVDbGlwUGF0aCA9IHRoaXMuX2Nvcm5lcnNEb3RDbGlwUGF0aCA9IGNvcm5lcnNEb3RDbGlwUGF0aCA9IGNvcm5lcnNTcXVhcmVDbGlwUGF0aDtcblxuICAgICAgICB0aGlzLl9jcmVhdGVDb2xvcih7XG4gICAgICAgICAgb3B0aW9uczogb3B0aW9ucy5jb3JuZXJzU3F1YXJlT3B0aW9ucz8uZ3JhZGllbnQsXG4gICAgICAgICAgY29sb3I6IG9wdGlvbnMuY29ybmVyc1NxdWFyZU9wdGlvbnM/LmNvbG9yLFxuICAgICAgICAgIGFkZGl0aW9uYWxSb3RhdGlvbjogcm90YXRpb24sXG4gICAgICAgICAgeCxcbiAgICAgICAgICB5LFxuICAgICAgICAgIGhlaWdodDogY29ybmVyc1NxdWFyZVNpemUsXG4gICAgICAgICAgd2lkdGg6IGNvcm5lcnNTcXVhcmVTaXplLFxuICAgICAgICAgIG5hbWU6IGBjb3JuZXJzLXNxdWFyZS1jb2xvci0ke2NvbHVtbn0tJHtyb3d9YFxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdGlvbnMuY29ybmVyc1NxdWFyZU9wdGlvbnM/LnR5cGUpIHtcbiAgICAgICAgY29uc3QgY29ybmVyc1NxdWFyZSA9IG5ldyBRUkNvcm5lclNxdWFyZSh7IHN2ZzogdGhpcy5fZWxlbWVudCwgdHlwZTogb3B0aW9ucy5jb3JuZXJzU3F1YXJlT3B0aW9ucy50eXBlIH0pO1xuXG4gICAgICAgIGNvcm5lcnNTcXVhcmUuZHJhdyh4LCB5LCBjb3JuZXJzU3F1YXJlU2l6ZSwgcm90YXRpb24pO1xuXG4gICAgICAgIGlmIChjb3JuZXJzU3F1YXJlLl9lbGVtZW50ICYmIGNvcm5lcnNTcXVhcmVDbGlwUGF0aCkge1xuICAgICAgICAgIGNvcm5lcnNTcXVhcmVDbGlwUGF0aC5hcHBlbmRDaGlsZChjb3JuZXJzU3F1YXJlLl9lbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZG90ID0gbmV3IFFSRG90KHsgc3ZnOiB0aGlzLl9lbGVtZW50LCB0eXBlOiBvcHRpb25zLmRvdHNPcHRpb25zLnR5cGUgfSk7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzcXVhcmVNYXNrLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBzcXVhcmVNYXNrW2ldLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBpZiAoIXNxdWFyZU1hc2tbaV0/LltqXSkge1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZG90LmRyYXcoXG4gICAgICAgICAgICAgIHggKyBpICogZG90U2l6ZSxcbiAgICAgICAgICAgICAgeSArIGogKiBkb3RTaXplLFxuICAgICAgICAgICAgICBkb3RTaXplLFxuICAgICAgICAgICAgICAoeE9mZnNldDogbnVtYmVyLCB5T2Zmc2V0OiBudW1iZXIpOiBib29sZWFuID0+ICEhc3F1YXJlTWFza1tpICsgeE9mZnNldF0/LltqICsgeU9mZnNldF1cbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGlmIChkb3QuX2VsZW1lbnQgJiYgY29ybmVyc1NxdWFyZUNsaXBQYXRoKSB7XG4gICAgICAgICAgICAgIGNvcm5lcnNTcXVhcmVDbGlwUGF0aC5hcHBlbmRDaGlsZChkb3QuX2VsZW1lbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAob3B0aW9ucy5jb3JuZXJzRG90T3B0aW9ucz8uZ3JhZGllbnQgfHwgb3B0aW9ucy5jb3JuZXJzRG90T3B0aW9ucz8uY29sb3IpIHtcbiAgICAgICAgY29ybmVyc0RvdENsaXBQYXRoID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJjbGlwUGF0aFwiKTtcbiAgICAgICAgY29ybmVyc0RvdENsaXBQYXRoLnNldEF0dHJpYnV0ZShcImlkXCIsIGBjbGlwLXBhdGgtY29ybmVycy1kb3QtY29sb3ItJHtjb2x1bW59LSR7cm93fWApO1xuICAgICAgICB0aGlzLl9kZWZzLmFwcGVuZENoaWxkKGNvcm5lcnNEb3RDbGlwUGF0aCk7XG4gICAgICAgIHRoaXMuX2Nvcm5lcnNEb3RDbGlwUGF0aCA9IGNvcm5lcnNEb3RDbGlwUGF0aDtcblxuICAgICAgICB0aGlzLl9jcmVhdGVDb2xvcih7XG4gICAgICAgICAgb3B0aW9uczogb3B0aW9ucy5jb3JuZXJzRG90T3B0aW9ucz8uZ3JhZGllbnQsXG4gICAgICAgICAgY29sb3I6IG9wdGlvbnMuY29ybmVyc0RvdE9wdGlvbnM/LmNvbG9yLFxuICAgICAgICAgIGFkZGl0aW9uYWxSb3RhdGlvbjogcm90YXRpb24sXG4gICAgICAgICAgeDogeCArIGRvdFNpemUgKiAyLFxuICAgICAgICAgIHk6IHkgKyBkb3RTaXplICogMixcbiAgICAgICAgICBoZWlnaHQ6IGNvcm5lcnNEb3RTaXplLFxuICAgICAgICAgIHdpZHRoOiBjb3JuZXJzRG90U2l6ZSxcbiAgICAgICAgICBuYW1lOiBgY29ybmVycy1kb3QtY29sb3ItJHtjb2x1bW59LSR7cm93fWBcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRpb25zLmNvcm5lcnNEb3RPcHRpb25zPy50eXBlKSB7XG4gICAgICAgIGNvbnN0IGNvcm5lcnNEb3QgPSBuZXcgUVJDb3JuZXJEb3Qoe1xuICAgICAgICAgIHN2ZzogdGhpcy5fZWxlbWVudCxcbiAgICAgICAgICB0eXBlOiBvcHRpb25zLmNvcm5lcnNEb3RPcHRpb25zLnR5cGUsXG4gICAgICAgICAgY29sb3I6IG9wdGlvbnMuY29ybmVyc0RvdE9wdGlvbnMuY29sb3IgPz8gb3B0aW9ucy5kb3RzT3B0aW9ucy5jb2xvclxuICAgICAgICB9KTtcblxuICAgICAgICBjb3JuZXJzRG90LmRyYXcoeCArIGRvdFNpemUgKiAyLCB5ICsgZG90U2l6ZSAqIDIsIGNvcm5lcnNEb3RTaXplLCByb3RhdGlvbik7XG5cbiAgICAgICAgaWYgKGNvcm5lcnNEb3QuX2VsZW1lbnQgJiYgY29ybmVyc0RvdENsaXBQYXRoKSB7XG4gICAgICAgICAgY29ybmVyc0RvdENsaXBQYXRoLmFwcGVuZENoaWxkKGNvcm5lcnNEb3QuX2VsZW1lbnQpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBkb3QgPSBuZXcgUVJEb3QoeyBzdmc6IHRoaXMuX2VsZW1lbnQsIHR5cGU6IG9wdGlvbnMuZG90c09wdGlvbnMudHlwZSB9KTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRvdE1hc2subGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGRvdE1hc2tbaV0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGlmICghZG90TWFza1tpXT8uW2pdKSB7XG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkb3QuZHJhdyhcbiAgICAgICAgICAgICAgeCArIGkgKiBkb3RTaXplLFxuICAgICAgICAgICAgICB5ICsgaiAqIGRvdFNpemUsXG4gICAgICAgICAgICAgIGRvdFNpemUsXG4gICAgICAgICAgICAgICh4T2Zmc2V0OiBudW1iZXIsIHlPZmZzZXQ6IG51bWJlcik6IGJvb2xlYW4gPT4gISFkb3RNYXNrW2kgKyB4T2Zmc2V0XT8uW2ogKyB5T2Zmc2V0XVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgaWYgKGRvdC5fZWxlbWVudCAmJiBjb3JuZXJzRG90Q2xpcFBhdGgpIHtcbiAgICAgICAgICAgICAgY29ybmVyc0RvdENsaXBQYXRoLmFwcGVuZENoaWxkKGRvdC5fZWxlbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBsb2FkSW1hZ2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSB0aGlzLl9vcHRpb25zO1xuICAgICAgY29uc3QgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcblxuICAgICAgaWYgKCFvcHRpb25zLmltYWdlKSB7XG4gICAgICAgIHJldHVybiByZWplY3QoXCJJbWFnZSBpcyBub3QgZGVmaW5lZFwiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLmltYWdlT3B0aW9ucy5jcm9zc09yaWdpbiA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICBpbWFnZS5jcm9zc09yaWdpbiA9IG9wdGlvbnMuaW1hZ2VPcHRpb25zLmNyb3NzT3JpZ2luO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9pbWFnZSA9IGltYWdlO1xuICAgICAgaW1hZ2Uub25sb2FkID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9O1xuICAgICAgaW1hZ2Uuc3JjID0gb3B0aW9ucy5pbWFnZTtcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIGRyYXdJbWFnZSh7XG4gICAgd2lkdGgsXG4gICAgaGVpZ2h0LFxuICAgIGNvdW50LFxuICAgIGRvdFNpemVcbiAgfToge1xuICAgIHdpZHRoOiBudW1iZXI7XG4gICAgaGVpZ2h0OiBudW1iZXI7XG4gICAgY291bnQ6IG51bWJlcjtcbiAgICBkb3RTaXplOiBudW1iZXI7XG4gIH0pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBvcHRpb25zID0gdGhpcy5fb3B0aW9ucztcbiAgICBjb25zdCB4QmVnaW5uaW5nID0gTWF0aC5mbG9vcigob3B0aW9ucy53aWR0aCAtIGNvdW50ICogZG90U2l6ZSkgLyAyKTtcbiAgICBjb25zdCB5QmVnaW5uaW5nID0gTWF0aC5mbG9vcigob3B0aW9ucy5oZWlnaHQgLSBjb3VudCAqIGRvdFNpemUpIC8gMik7XG4gICAgY29uc3QgZHggPSB4QmVnaW5uaW5nICsgb3B0aW9ucy5pbWFnZU9wdGlvbnMubWFyZ2luICsgKGNvdW50ICogZG90U2l6ZSAtIHdpZHRoKSAvIDI7XG4gICAgY29uc3QgZHkgPSB5QmVnaW5uaW5nICsgb3B0aW9ucy5pbWFnZU9wdGlvbnMubWFyZ2luICsgKGNvdW50ICogZG90U2l6ZSAtIGhlaWdodCkgLyAyO1xuICAgIGNvbnN0IGR3ID0gd2lkdGggLSBvcHRpb25zLmltYWdlT3B0aW9ucy5tYXJnaW4gKiAyO1xuICAgIGNvbnN0IGRoID0gaGVpZ2h0IC0gb3B0aW9ucy5pbWFnZU9wdGlvbnMubWFyZ2luICogMjtcblxuICAgIGNvbnN0IGltYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJpbWFnZVwiKTtcbiAgICBpbWFnZS5zZXRBdHRyaWJ1dGUoXCJ4XCIsIFN0cmluZyhkeCkpO1xuICAgIGltYWdlLnNldEF0dHJpYnV0ZShcInlcIiwgU3RyaW5nKGR5KSk7XG4gICAgaW1hZ2Uuc2V0QXR0cmlidXRlKFwid2lkdGhcIiwgYCR7ZHd9cHhgKTtcbiAgICBpbWFnZS5zZXRBdHRyaWJ1dGUoXCJoZWlnaHRcIiwgYCR7ZGh9cHhgKTtcblxuICAgIGNvbnN0IGltYWdlVXJsID0gYXdhaXQgdG9EYXRhVXJsKG9wdGlvbnMuaW1hZ2UgfHwgXCJcIik7XG5cbiAgICBpbWFnZS5zZXRBdHRyaWJ1dGUoXCJocmVmXCIsIGltYWdlVXJsIHx8IFwiXCIpO1xuXG4gICAgdGhpcy5fZWxlbWVudC5hcHBlbmRDaGlsZChpbWFnZSk7XG4gIH1cblxuICBfY3JlYXRlQ29sb3Ioe1xuICAgIG9wdGlvbnMsXG4gICAgY29sb3IsXG4gICAgYWRkaXRpb25hbFJvdGF0aW9uLFxuICAgIHgsXG4gICAgeSxcbiAgICBoZWlnaHQsXG4gICAgd2lkdGgsXG4gICAgbmFtZVxuICB9OiB7XG4gICAgb3B0aW9ucz86IEdyYWRpZW50O1xuICAgIGNvbG9yPzogc3RyaW5nO1xuICAgIGFkZGl0aW9uYWxSb3RhdGlvbjogbnVtYmVyO1xuICAgIHg6IG51bWJlcjtcbiAgICB5OiBudW1iZXI7XG4gICAgaGVpZ2h0OiBudW1iZXI7XG4gICAgd2lkdGg6IG51bWJlcjtcbiAgICBuYW1lOiBzdHJpbmc7XG4gIH0pOiB2b2lkIHtcbiAgICBjb25zdCBzaXplID0gd2lkdGggPiBoZWlnaHQgPyB3aWR0aCA6IGhlaWdodDtcbiAgICBjb25zdCByZWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJyZWN0XCIpO1xuICAgIHJlY3Quc2V0QXR0cmlidXRlKFwieFwiLCBTdHJpbmcoeCkpO1xuICAgIHJlY3Quc2V0QXR0cmlidXRlKFwieVwiLCBTdHJpbmcoeSkpO1xuICAgIHJlY3Quc2V0QXR0cmlidXRlKFwiaGVpZ2h0XCIsIFN0cmluZyhoZWlnaHQpKTtcbiAgICByZWN0LnNldEF0dHJpYnV0ZShcIndpZHRoXCIsIFN0cmluZyh3aWR0aCkpO1xuICAgIHJlY3Quc2V0QXR0cmlidXRlKFwiY2xpcC1wYXRoXCIsIGB1cmwoJyNjbGlwLXBhdGgtJHtuYW1lfScpYCk7XG5cbiAgICBpZiAob3B0aW9ucykge1xuICAgICAgbGV0IGdyYWRpZW50OiBTVkdFbGVtZW50O1xuICAgICAgaWYgKG9wdGlvbnMudHlwZSA9PT0gZ3JhZGllbnRUeXBlcy5yYWRpYWwpIHtcbiAgICAgICAgZ3JhZGllbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcInJhZGlhbEdyYWRpZW50XCIpO1xuICAgICAgICBncmFkaWVudC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBuYW1lKTtcbiAgICAgICAgZ3JhZGllbnQuc2V0QXR0cmlidXRlKFwiZ3JhZGllbnRVbml0c1wiLCBcInVzZXJTcGFjZU9uVXNlXCIpO1xuICAgICAgICBncmFkaWVudC5zZXRBdHRyaWJ1dGUoXCJmeFwiLCBTdHJpbmcoeCArIHdpZHRoIC8gMikpO1xuICAgICAgICBncmFkaWVudC5zZXRBdHRyaWJ1dGUoXCJmeVwiLCBTdHJpbmcoeSArIGhlaWdodCAvIDIpKTtcbiAgICAgICAgZ3JhZGllbnQuc2V0QXR0cmlidXRlKFwiY3hcIiwgU3RyaW5nKHggKyB3aWR0aCAvIDIpKTtcbiAgICAgICAgZ3JhZGllbnQuc2V0QXR0cmlidXRlKFwiY3lcIiwgU3RyaW5nKHkgKyBoZWlnaHQgLyAyKSk7XG4gICAgICAgIGdyYWRpZW50LnNldEF0dHJpYnV0ZShcInJcIiwgU3RyaW5nKHNpemUgLyAyKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCByb3RhdGlvbiA9ICgob3B0aW9ucy5yb3RhdGlvbiB8fCAwKSArIGFkZGl0aW9uYWxSb3RhdGlvbikgJSAoMiAqIE1hdGguUEkpO1xuICAgICAgICBjb25zdCBwb3NpdGl2ZVJvdGF0aW9uID0gKHJvdGF0aW9uICsgMiAqIE1hdGguUEkpICUgKDIgKiBNYXRoLlBJKTtcbiAgICAgICAgbGV0IHgwID0geCArIHdpZHRoIC8gMjtcbiAgICAgICAgbGV0IHkwID0geSArIGhlaWdodCAvIDI7XG4gICAgICAgIGxldCB4MSA9IHggKyB3aWR0aCAvIDI7XG4gICAgICAgIGxldCB5MSA9IHkgKyBoZWlnaHQgLyAyO1xuXG4gICAgICAgIGlmIChcbiAgICAgICAgICAocG9zaXRpdmVSb3RhdGlvbiA+PSAwICYmIHBvc2l0aXZlUm90YXRpb24gPD0gMC4yNSAqIE1hdGguUEkpIHx8XG4gICAgICAgICAgKHBvc2l0aXZlUm90YXRpb24gPiAxLjc1ICogTWF0aC5QSSAmJiBwb3NpdGl2ZVJvdGF0aW9uIDw9IDIgKiBNYXRoLlBJKVxuICAgICAgICApIHtcbiAgICAgICAgICB4MCA9IHgwIC0gd2lkdGggLyAyO1xuICAgICAgICAgIHkwID0geTAgLSAoaGVpZ2h0IC8gMikgKiBNYXRoLnRhbihyb3RhdGlvbik7XG4gICAgICAgICAgeDEgPSB4MSArIHdpZHRoIC8gMjtcbiAgICAgICAgICB5MSA9IHkxICsgKGhlaWdodCAvIDIpICogTWF0aC50YW4ocm90YXRpb24pO1xuICAgICAgICB9IGVsc2UgaWYgKHBvc2l0aXZlUm90YXRpb24gPiAwLjI1ICogTWF0aC5QSSAmJiBwb3NpdGl2ZVJvdGF0aW9uIDw9IDAuNzUgKiBNYXRoLlBJKSB7XG4gICAgICAgICAgeTAgPSB5MCAtIGhlaWdodCAvIDI7XG4gICAgICAgICAgeDAgPSB4MCAtIHdpZHRoIC8gMiAvIE1hdGgudGFuKHJvdGF0aW9uKTtcbiAgICAgICAgICB5MSA9IHkxICsgaGVpZ2h0IC8gMjtcbiAgICAgICAgICB4MSA9IHgxICsgd2lkdGggLyAyIC8gTWF0aC50YW4ocm90YXRpb24pO1xuICAgICAgICB9IGVsc2UgaWYgKHBvc2l0aXZlUm90YXRpb24gPiAwLjc1ICogTWF0aC5QSSAmJiBwb3NpdGl2ZVJvdGF0aW9uIDw9IDEuMjUgKiBNYXRoLlBJKSB7XG4gICAgICAgICAgeDAgPSB4MCArIHdpZHRoIC8gMjtcbiAgICAgICAgICB5MCA9IHkwICsgKGhlaWdodCAvIDIpICogTWF0aC50YW4ocm90YXRpb24pO1xuICAgICAgICAgIHgxID0geDEgLSB3aWR0aCAvIDI7XG4gICAgICAgICAgeTEgPSB5MSAtIChoZWlnaHQgLyAyKSAqIE1hdGgudGFuKHJvdGF0aW9uKTtcbiAgICAgICAgfSBlbHNlIGlmIChwb3NpdGl2ZVJvdGF0aW9uID4gMS4yNSAqIE1hdGguUEkgJiYgcG9zaXRpdmVSb3RhdGlvbiA8PSAxLjc1ICogTWF0aC5QSSkge1xuICAgICAgICAgIHkwID0geTAgKyBoZWlnaHQgLyAyO1xuICAgICAgICAgIHgwID0geDAgKyB3aWR0aCAvIDIgLyBNYXRoLnRhbihyb3RhdGlvbik7XG4gICAgICAgICAgeTEgPSB5MSAtIGhlaWdodCAvIDI7XG4gICAgICAgICAgeDEgPSB4MSAtIHdpZHRoIC8gMiAvIE1hdGgudGFuKHJvdGF0aW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGdyYWRpZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJsaW5lYXJHcmFkaWVudFwiKTtcbiAgICAgICAgZ3JhZGllbnQuc2V0QXR0cmlidXRlKFwiaWRcIiwgbmFtZSk7XG4gICAgICAgIGdyYWRpZW50LnNldEF0dHJpYnV0ZShcImdyYWRpZW50VW5pdHNcIiwgXCJ1c2VyU3BhY2VPblVzZVwiKTtcbiAgICAgICAgZ3JhZGllbnQuc2V0QXR0cmlidXRlKFwieDFcIiwgU3RyaW5nKE1hdGgucm91bmQoeDApKSk7XG4gICAgICAgIGdyYWRpZW50LnNldEF0dHJpYnV0ZShcInkxXCIsIFN0cmluZyhNYXRoLnJvdW5kKHkwKSkpO1xuICAgICAgICBncmFkaWVudC5zZXRBdHRyaWJ1dGUoXCJ4MlwiLCBTdHJpbmcoTWF0aC5yb3VuZCh4MSkpKTtcbiAgICAgICAgZ3JhZGllbnQuc2V0QXR0cmlidXRlKFwieTJcIiwgU3RyaW5nKE1hdGgucm91bmQoeTEpKSk7XG4gICAgICB9XG5cbiAgICAgIG9wdGlvbnMuY29sb3JTdG9wcy5mb3JFYWNoKCh7IG9mZnNldCwgY29sb3IgfTogeyBvZmZzZXQ6IG51bWJlcjsgY29sb3I6IHN0cmluZyB9KSA9PiB7XG4gICAgICAgIGNvbnN0IHN0b3AgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcInN0b3BcIik7XG4gICAgICAgIHN0b3Auc2V0QXR0cmlidXRlKFwib2Zmc2V0XCIsIGAkezEwMCAqIG9mZnNldH0lYCk7XG4gICAgICAgIHN0b3Auc2V0QXR0cmlidXRlKFwic3RvcC1jb2xvclwiLCBjb2xvcik7XG4gICAgICAgIGdyYWRpZW50LmFwcGVuZENoaWxkKHN0b3ApO1xuICAgICAgfSk7XG5cbiAgICAgIHJlY3Quc2V0QXR0cmlidXRlKFwiZmlsbFwiLCBgdXJsKCcjJHtuYW1lfScpYCk7XG4gICAgICB0aGlzLl9kZWZzLmFwcGVuZENoaWxkKGdyYWRpZW50KTtcbiAgICB9IGVsc2UgaWYgKGNvbG9yKSB7XG4gICAgICByZWN0LnNldEF0dHJpYnV0ZShcImZpbGxcIiwgY29sb3IpO1xuICAgIH1cblxuICAgIHRoaXMuX2VsZW1lbnQuYXBwZW5kQ2hpbGQocmVjdCk7XG4gIH1cbn1cbiIsImltcG9ydCBjb3JuZXJEb3RUeXBlcyBmcm9tIFwiLi4vLi4vY29uc3RhbnRzL2Nvcm5lckRvdFR5cGVzXCI7XG5pbXBvcnQgeyBDb3JuZXJEb3RUeXBlLCBSb3RhdGVGaWd1cmVBcmdzLCBCYXNpY0ZpZ3VyZURyYXdBcmdzLCBEcmF3QXJncyB9IGZyb20gXCIuLi8uLi90eXBlc1wiO1xuaW1wb3J0IHsgY3JlYXRlSGVhcnRTVkcgfSBmcm9tIFwiLi4vLi4vc2hhcGVzL2NyZWF0ZUhlYXJ0U1ZHXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFFSQ29ybmVyRG90IHtcbiAgX2VsZW1lbnQ/OiBTVkdFbGVtZW50O1xuICBfc3ZnOiBTVkdFbGVtZW50O1xuICBfdHlwZTogQ29ybmVyRG90VHlwZTtcbiAgX2NvbG9yPzogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHsgc3ZnLCB0eXBlLCBjb2xvciB9OiB7IHN2ZzogU1ZHRWxlbWVudDsgdHlwZTogQ29ybmVyRG90VHlwZTsgY29sb3I/OiBzdHJpbmcgfSkge1xuICAgIHRoaXMuX3N2ZyA9IHN2ZztcbiAgICB0aGlzLl90eXBlID0gdHlwZTtcbiAgICB0aGlzLl9jb2xvciA9IGNvbG9yO1xuICB9XG5cbiAgZHJhdyh4OiBudW1iZXIsIHk6IG51bWJlciwgc2l6ZTogbnVtYmVyLCByb3RhdGlvbjogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgdHlwZSA9IHRoaXMuX3R5cGU7XG4gICAgbGV0IGRyYXdGdW5jdGlvbjtcblxuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgY2FzZSBjb3JuZXJEb3RUeXBlcy5zcXVhcmU6XG4gICAgICAgIGRyYXdGdW5jdGlvbiA9IHRoaXMuX2RyYXdTcXVhcmU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBjb3JuZXJEb3RUeXBlcy5oZWFydDpcbiAgICAgICAgZHJhd0Z1bmN0aW9uID0gdGhpcy5fZHJhd0hlYXJ0O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgY29ybmVyRG90VHlwZXMuc3RhcjpcbiAgICAgICAgZHJhd0Z1bmN0aW9uID0gdGhpcy5fZHJhd1N0YXI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBjb3JuZXJEb3RUeXBlcy5kb3Q6XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBkcmF3RnVuY3Rpb24gPSB0aGlzLl9kcmF3RG90O1xuICAgIH1cblxuICAgIGRyYXdGdW5jdGlvbi5jYWxsKHRoaXMsIHsgeCwgeSwgc2l6ZSwgcm90YXRpb24gfSk7XG4gIH1cblxuICBfcm90YXRlRmlndXJlKHsgeCwgeSwgc2l6ZSwgcm90YXRpb24gPSAwLCBkcmF3IH06IFJvdGF0ZUZpZ3VyZUFyZ3MpOiB2b2lkIHtcbiAgICBjb25zdCBjeCA9IHggKyBzaXplIC8gMjtcbiAgICBjb25zdCBjeSA9IHkgKyBzaXplIC8gMjtcblxuICAgIGRyYXcoKTtcbiAgICB0aGlzLl9lbGVtZW50Py5zZXRBdHRyaWJ1dGUoXCJ0cmFuc2Zvcm1cIiwgYHJvdGF0ZSgkeygxODAgKiByb3RhdGlvbikgLyBNYXRoLlBJfSwke2N4fSwke2N5fSlgKTtcbiAgfVxuXG4gIF9iYXNpY0RvdChhcmdzOiBCYXNpY0ZpZ3VyZURyYXdBcmdzKTogdm9pZCB7XG4gICAgY29uc3QgeyBzaXplLCB4LCB5IH0gPSBhcmdzO1xuXG4gICAgdGhpcy5fcm90YXRlRmlndXJlKHtcbiAgICAgIC4uLmFyZ3MsXG4gICAgICBkcmF3OiAoKSA9PiB7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcImNpcmNsZVwiKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJjeFwiLCBTdHJpbmcoeCArIHNpemUgLyAyKSk7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKFwiY3lcIiwgU3RyaW5nKHkgKyBzaXplIC8gMikpO1xuICAgICAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShcInJcIiwgU3RyaW5nKHNpemUgLyAyKSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBfYmFzaWNTcXVhcmUoYXJnczogQmFzaWNGaWd1cmVEcmF3QXJncyk6IHZvaWQge1xuICAgIGNvbnN0IHsgc2l6ZSwgeCwgeSB9ID0gYXJncztcblxuICAgIHRoaXMuX3JvdGF0ZUZpZ3VyZSh7XG4gICAgICAuLi5hcmdzLFxuICAgICAgZHJhdzogKCkgPT4ge1xuICAgICAgICB0aGlzLl9lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJyZWN0XCIpO1xuICAgICAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShcInhcIiwgU3RyaW5nKHgpKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJ5XCIsIFN0cmluZyh5KSk7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKFwid2lkdGhcIiwgU3RyaW5nKHNpemUpKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJoZWlnaHRcIiwgU3RyaW5nKHNpemUpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIF9iYXNpY0hlYXJ0KGFyZ3M6IEJhc2ljRmlndXJlRHJhd0FyZ3MpOiB2b2lkIHtcbiAgICBjb25zdCB7IHgsIHksIHNpemUgfSA9IGFyZ3M7XG4gICAgdGhpcy5fcm90YXRlRmlndXJlKHtcbiAgICAgIC4uLmFyZ3MsXG4gICAgICBkcmF3OiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHhtbG5zID0gXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiO1xuXG4gICAgICAgIC8vIE5vdGUhIFdlIGhhdmUgdG8gd3JhcCB0aGUgU1ZHIHdpdGggYSBmb3JlaWduT2JqZWN0IGVsZW1lbnQgaW4gb3JkZXIgdG8gcm90YXRlIGl0ISEhXG4gICAgICAgIGNvbnN0IGZvcmVpZ25PYmplY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoeG1sbnMsIFwiZm9yZWlnbk9iamVjdFwiKTtcbiAgICAgICAgZm9yZWlnbk9iamVjdC5zZXRBdHRyaWJ1dGUoXCJ4XCIsIFN0cmluZyh4KSk7XG4gICAgICAgIGZvcmVpZ25PYmplY3Quc2V0QXR0cmlidXRlKFwieVwiLCBTdHJpbmcoeSkpO1xuICAgICAgICBmb3JlaWduT2JqZWN0LnNldEF0dHJpYnV0ZShcIndpZHRoXCIsIFN0cmluZyhzaXplKSk7XG4gICAgICAgIGZvcmVpZ25PYmplY3Quc2V0QXR0cmlidXRlKFwiaGVpZ2h0XCIsIFN0cmluZyhzaXplKSk7XG5cbiAgICAgICAgY29uc3Qgc3ZnID0gY3JlYXRlSGVhcnRTVkcoc2l6ZSwgdGhpcy5fY29sb3IgPz8gXCJibGFja1wiKTtcbiAgICAgICAgZm9yZWlnbk9iamVjdC5hcHBlbmQoc3ZnKTtcblxuICAgICAgICAvLyBJTVBPUlRBTlQhIEZvciBlbWJlZGRlZCBTVkcgY29ybmVyczogQXBwZW5kIHRvICd0aGlzLl9zdmcnIC0gTk9UIHRvICd0aGlzLl9lbGVtZW50JyBiZWNhdXNlIHRoZSBsYXR0ZXIgd291bGQgYmUgYWRkZWQgdG8gYSBjbGlwUGF0aFxuICAgICAgICB0aGlzLl9zdmcuYXBwZW5kQ2hpbGQoZm9yZWlnbk9iamVjdCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBfZHJhd0RvdCh7IHgsIHksIHNpemUsIHJvdGF0aW9uIH06IERyYXdBcmdzKTogdm9pZCB7XG4gICAgdGhpcy5fYmFzaWNEb3QoeyB4LCB5LCBzaXplLCByb3RhdGlvbiB9KTtcbiAgfVxuXG4gIF9kcmF3U3F1YXJlKHsgeCwgeSwgc2l6ZSwgcm90YXRpb24gfTogRHJhd0FyZ3MpOiB2b2lkIHtcbiAgICB0aGlzLl9iYXNpY1NxdWFyZSh7IHgsIHksIHNpemUsIHJvdGF0aW9uIH0pO1xuICB9XG5cbiAgX2RyYXdIZWFydCh7IHgsIHksIHNpemUsIHJvdGF0aW9uIH06IERyYXdBcmdzKTogdm9pZCB7XG4gICAgY29uc3Qgc2NhbGVGYWN0b3IgPSAwLjI7XG4gICAgdGhpcy5fYmFzaWNIZWFydCh7XG4gICAgICB4OiB4IC0gKHNjYWxlRmFjdG9yICogc2l6ZSkgLyAyLFxuICAgICAgeTogeSAtIChzY2FsZUZhY3RvciAqIHNpemUpIC8gMixcbiAgICAgIHNpemU6IHNpemUgKiAoMSArIHNjYWxlRmFjdG9yKSxcbiAgICAgIHJvdGF0aW9uXG4gICAgfSk7XG4gIH1cblxuICBfZHJhd1N0YXIoeyB4LCB5LCBzaXplLCByb3RhdGlvbiB9OiBEcmF3QXJncyk6IHZvaWQge1xuICAgIGNvbnN0IHhtbG5zID0gXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiO1xuICAgIGNvbnN0IHN0YXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoeG1sbnMsIFwicG9seWdvblwiKTtcblxuICAgIGNvbnN0IGN4ID0geCArIHNpemUgLyAyO1xuICAgIGNvbnN0IGN5ID0geSArIHNpemUgLyAyO1xuICAgIGNvbnN0IHIgPSBzaXplIC8gMjtcblxuICAgIGNvbnN0IHBvaW50cyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNjsgaSsrKSB7XG4gICAgICBjb25zdCB4ID0gY3ggKyByICogTWF0aC5jb3MoKGkgKiAyICogTWF0aC5QSSkgLyA1IC0gTWF0aC5QSSAvIDIpO1xuICAgICAgY29uc3QgeSA9IGN5ICsgciAqIE1hdGguc2luKChpICogMiAqIE1hdGguUEkpIC8gNSAtIE1hdGguUEkgLyAyKTtcbiAgICAgIHBvaW50cy5wdXNoKGAke3h9LCR7eX1gKTtcbiAgICB9XG4gICAgc3Rhci5zZXRBdHRyaWJ1dGUoXCJwb2ludHNcIiwgcG9pbnRzLmpvaW4oXCIgXCIpKTtcblxuICAgIHRoaXMuX3JvdGF0ZUZpZ3VyZSh7XG4gICAgICB4LFxuICAgICAgeSxcbiAgICAgIHNpemUsXG4gICAgICAgZHJhdzogKCkgPT4ge1xuICAgICAgICB0aGlzLl9lbGVtZW50ID0gc3RhcjtcbiAgICAgIH1cbiAgICAgfSk7ICAgIFxuICB9XG59XG5cbiIsImltcG9ydCBjb3JuZXJTcXVhcmVUeXBlcyBmcm9tIFwiLi4vLi4vY29uc3RhbnRzL2Nvcm5lclNxdWFyZVR5cGVzXCI7XG5pbXBvcnQgeyBDb3JuZXJTcXVhcmVUeXBlLCBEcmF3QXJncywgQmFzaWNGaWd1cmVEcmF3QXJncywgUm90YXRlRmlndXJlQXJncyB9IGZyb20gXCIuLi8uLi90eXBlc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBRUkNvcm5lclNxdWFyZSB7XG4gIF9lbGVtZW50PzogU1ZHRWxlbWVudDtcbiAgX3N2ZzogU1ZHRWxlbWVudDtcbiAgX3R5cGU6IENvcm5lclNxdWFyZVR5cGU7XG5cbiAgY29uc3RydWN0b3IoeyBzdmcsIHR5cGUgfTogeyBzdmc6IFNWR0VsZW1lbnQ7IHR5cGU6IENvcm5lclNxdWFyZVR5cGUgfSkge1xuICAgIHRoaXMuX3N2ZyA9IHN2ZztcbiAgICB0aGlzLl90eXBlID0gdHlwZTtcbiAgfVxuXG4gIGRyYXcoeDogbnVtYmVyLCB5OiBudW1iZXIsIHNpemU6IG51bWJlciwgcm90YXRpb246IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IHR5cGUgPSB0aGlzLl90eXBlO1xuICAgIGxldCBkcmF3RnVuY3Rpb247XG5cbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgY29ybmVyU3F1YXJlVHlwZXMuc3F1YXJlOlxuICAgICAgICBkcmF3RnVuY3Rpb24gPSB0aGlzLl9kcmF3U3F1YXJlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgY29ybmVyU3F1YXJlVHlwZXMuZXh0cmFSb3VuZGVkOlxuICAgICAgICBkcmF3RnVuY3Rpb24gPSB0aGlzLl9kcmF3RXh0cmFSb3VuZGVkO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgY29ybmVyU3F1YXJlVHlwZXMuZG90OlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgZHJhd0Z1bmN0aW9uID0gdGhpcy5fZHJhd0RvdDtcbiAgICB9XG5cbiAgICBkcmF3RnVuY3Rpb24uY2FsbCh0aGlzLCB7IHgsIHksIHNpemUsIHJvdGF0aW9uIH0pO1xuICB9XG5cbiAgX3JvdGF0ZUZpZ3VyZSh7IHgsIHksIHNpemUsIHJvdGF0aW9uID0gMCwgZHJhdyB9OiBSb3RhdGVGaWd1cmVBcmdzKTogdm9pZCB7XG4gICAgY29uc3QgY3ggPSB4ICsgc2l6ZSAvIDI7XG4gICAgY29uc3QgY3kgPSB5ICsgc2l6ZSAvIDI7XG5cbiAgICBkcmF3KCk7XG4gICAgdGhpcy5fZWxlbWVudD8uc2V0QXR0cmlidXRlKFwidHJhbnNmb3JtXCIsIGByb3RhdGUoJHsoMTgwICogcm90YXRpb24pIC8gTWF0aC5QSX0sJHtjeH0sJHtjeX0pYCk7XG4gIH1cblxuICBfYmFzaWNEb3QoYXJnczogQmFzaWNGaWd1cmVEcmF3QXJncyk6IHZvaWQge1xuICAgIGNvbnN0IHsgc2l6ZSwgeCwgeSB9ID0gYXJncztcbiAgICBjb25zdCBkb3RTaXplID0gc2l6ZSAvIDc7XG5cbiAgICB0aGlzLl9yb3RhdGVGaWd1cmUoe1xuICAgICAgLi4uYXJncyxcbiAgICAgIGRyYXc6ICgpID0+IHtcbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwicGF0aFwiKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJjbGlwLXJ1bGVcIiwgXCJldmVub2RkXCIpO1xuICAgICAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShcbiAgICAgICAgICBcImRcIixcbiAgICAgICAgICBgTSAke3ggKyBzaXplIC8gMn0gJHt5fWAgKyAvLyBNIGN4LCB5IC8vICBNb3ZlIHRvIHRvcCBvZiByaW5nXG4gICAgICAgICAgICBgYSAke3NpemUgLyAyfSAke3NpemUgLyAyfSAwIDEgMCAwLjEgMGAgKyAvLyBhIG91dGVyUmFkaXVzLCBvdXRlclJhZGl1cywgMCwgMSwgMCwgMSwgMCAvLyBEcmF3IG91dGVyIGFyYywgYnV0IGRvbid0IGNsb3NlIGl0XG4gICAgICAgICAgICBgemAgKyAvLyBaIC8vIENsb3NlIHRoZSBvdXRlciBzaGFwZVxuICAgICAgICAgICAgYG0gMCAke2RvdFNpemV9YCArIC8vIG0gLTEgb3V0ZXJSYWRpdXMtaW5uZXJSYWRpdXMgLy8gTW92ZSB0byB0b3AgcG9pbnQgb2YgaW5uZXIgcmFkaXVzXG4gICAgICAgICAgICBgYSAke3NpemUgLyAyIC0gZG90U2l6ZX0gJHtzaXplIC8gMiAtIGRvdFNpemV9IDAgMSAxIC0wLjEgMGAgKyAvLyBhIGlubmVyUmFkaXVzLCBpbm5lclJhZGl1cywgMCwgMSwgMSwgLTEsIDAgLy8gRHJhdyBpbm5lciBhcmMsIGJ1dCBkb24ndCBjbG9zZSBpdFxuICAgICAgICAgICAgYFpgIC8vIFogLy8gQ2xvc2UgdGhlIGlubmVyIHJpbmcuIEFjdHVhbGx5IHdpbGwgc3RpbGwgd29yayB3aXRob3V0LCBidXQgaW5uZXIgcmluZyB3aWxsIGhhdmUgb25lIHVuaXQgbWlzc2luZyBpbiBzdHJva2VcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIF9iYXNpY1NxdWFyZShhcmdzOiBCYXNpY0ZpZ3VyZURyYXdBcmdzKTogdm9pZCB7XG4gICAgY29uc3QgeyBzaXplLCB4LCB5IH0gPSBhcmdzO1xuICAgIGNvbnN0IGRvdFNpemUgPSBzaXplIC8gNztcblxuICAgIHRoaXMuX3JvdGF0ZUZpZ3VyZSh7XG4gICAgICAuLi5hcmdzLFxuICAgICAgZHJhdzogKCkgPT4ge1xuICAgICAgICB0aGlzLl9lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJwYXRoXCIpO1xuICAgICAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShcImNsaXAtcnVsZVwiLCBcImV2ZW5vZGRcIik7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKFxuICAgICAgICAgIFwiZFwiLFxuICAgICAgICAgIGBNICR7eH0gJHt5fWAgK1xuICAgICAgICAgICAgYHYgJHtzaXplfWAgK1xuICAgICAgICAgICAgYGggJHtzaXplfWAgK1xuICAgICAgICAgICAgYHYgJHstc2l6ZX1gICtcbiAgICAgICAgICAgIGB6YCArXG4gICAgICAgICAgICBgTSAke3ggKyBkb3RTaXplfSAke3kgKyBkb3RTaXplfWAgK1xuICAgICAgICAgICAgYGggJHtzaXplIC0gMiAqIGRvdFNpemV9YCArXG4gICAgICAgICAgICBgdiAke3NpemUgLSAyICogZG90U2l6ZX1gICtcbiAgICAgICAgICAgIGBoICR7LXNpemUgKyAyICogZG90U2l6ZX1gICtcbiAgICAgICAgICAgIGB6YFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgX2Jhc2ljRXh0cmFSb3VuZGVkKGFyZ3M6IEJhc2ljRmlndXJlRHJhd0FyZ3MpOiB2b2lkIHtcbiAgICBjb25zdCB7IHNpemUsIHgsIHkgfSA9IGFyZ3M7XG4gICAgY29uc3QgZG90U2l6ZSA9IHNpemUgLyA3O1xuXG4gICAgdGhpcy5fcm90YXRlRmlndXJlKHtcbiAgICAgIC4uLmFyZ3MsXG4gICAgICBkcmF3OiAoKSA9PiB7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcInBhdGhcIik7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKFwiY2xpcC1ydWxlXCIsIFwiZXZlbm9kZFwiKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoXG4gICAgICAgICAgXCJkXCIsXG4gICAgICAgICAgYE0gJHt4fSAke3kgKyAyLjUgKiBkb3RTaXplfWAgK1xuICAgICAgICAgICAgYHYgJHsyICogZG90U2l6ZX1gICtcbiAgICAgICAgICAgIGBhICR7Mi41ICogZG90U2l6ZX0gJHsyLjUgKiBkb3RTaXplfSwgMCwgMCwgMCwgJHtkb3RTaXplICogMi41fSAke2RvdFNpemUgKiAyLjV9YCArXG4gICAgICAgICAgICBgaCAkezIgKiBkb3RTaXplfWAgK1xuICAgICAgICAgICAgYGEgJHsyLjUgKiBkb3RTaXplfSAkezIuNSAqIGRvdFNpemV9LCAwLCAwLCAwLCAke2RvdFNpemUgKiAyLjV9ICR7LWRvdFNpemUgKiAyLjV9YCArXG4gICAgICAgICAgICBgdiAkey0yICogZG90U2l6ZX1gICtcbiAgICAgICAgICAgIGBhICR7Mi41ICogZG90U2l6ZX0gJHsyLjUgKiBkb3RTaXplfSwgMCwgMCwgMCwgJHstZG90U2l6ZSAqIDIuNX0gJHstZG90U2l6ZSAqIDIuNX1gICtcbiAgICAgICAgICAgIGBoICR7LTIgKiBkb3RTaXplfWAgK1xuICAgICAgICAgICAgYGEgJHsyLjUgKiBkb3RTaXplfSAkezIuNSAqIGRvdFNpemV9LCAwLCAwLCAwLCAkey1kb3RTaXplICogMi41fSAke2RvdFNpemUgKiAyLjV9YCArXG4gICAgICAgICAgICBgTSAke3ggKyAyLjUgKiBkb3RTaXplfSAke3kgKyBkb3RTaXplfWAgK1xuICAgICAgICAgICAgYGggJHsyICogZG90U2l6ZX1gICtcbiAgICAgICAgICAgIGBhICR7MS41ICogZG90U2l6ZX0gJHsxLjUgKiBkb3RTaXplfSwgMCwgMCwgMSwgJHtkb3RTaXplICogMS41fSAke2RvdFNpemUgKiAxLjV9YCArXG4gICAgICAgICAgICBgdiAkezIgKiBkb3RTaXplfWAgK1xuICAgICAgICAgICAgYGEgJHsxLjUgKiBkb3RTaXplfSAkezEuNSAqIGRvdFNpemV9LCAwLCAwLCAxLCAkey1kb3RTaXplICogMS41fSAke2RvdFNpemUgKiAxLjV9YCArXG4gICAgICAgICAgICBgaCAkey0yICogZG90U2l6ZX1gICtcbiAgICAgICAgICAgIGBhICR7MS41ICogZG90U2l6ZX0gJHsxLjUgKiBkb3RTaXplfSwgMCwgMCwgMSwgJHstZG90U2l6ZSAqIDEuNX0gJHstZG90U2l6ZSAqIDEuNX1gICtcbiAgICAgICAgICAgIGB2ICR7LTIgKiBkb3RTaXplfWAgK1xuICAgICAgICAgICAgYGEgJHsxLjUgKiBkb3RTaXplfSAkezEuNSAqIGRvdFNpemV9LCAwLCAwLCAxLCAke2RvdFNpemUgKiAxLjV9ICR7LWRvdFNpemUgKiAxLjV9YFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgX2RyYXdEb3QoeyB4LCB5LCBzaXplLCByb3RhdGlvbiB9OiBEcmF3QXJncyk6IHZvaWQge1xuICAgIHRoaXMuX2Jhc2ljRG90KHsgeCwgeSwgc2l6ZSwgcm90YXRpb24gfSk7XG4gIH1cblxuICBfZHJhd1NxdWFyZSh7IHgsIHksIHNpemUsIHJvdGF0aW9uIH06IERyYXdBcmdzKTogdm9pZCB7XG4gICAgdGhpcy5fYmFzaWNTcXVhcmUoeyB4LCB5LCBzaXplLCByb3RhdGlvbiB9KTtcbiAgfVxuXG4gIF9kcmF3RXh0cmFSb3VuZGVkKHsgeCwgeSwgc2l6ZSwgcm90YXRpb24gfTogRHJhd0FyZ3MpOiB2b2lkIHtcbiAgICB0aGlzLl9iYXNpY0V4dHJhUm91bmRlZCh7IHgsIHksIHNpemUsIHJvdGF0aW9uIH0pO1xuICB9XG59XG4iLCJpbXBvcnQgZG90VHlwZXMgZnJvbSBcIi4uLy4uL2NvbnN0YW50cy9kb3RUeXBlc1wiO1xuaW1wb3J0IHsgRG90VHlwZSwgR2V0TmVpZ2hib3IsIERyYXdBcmdzLCBCYXNpY0ZpZ3VyZURyYXdBcmdzLCBSb3RhdGVGaWd1cmVBcmdzIH0gZnJvbSBcIi4uLy4uL3R5cGVzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFFSRG90IHtcbiAgX2VsZW1lbnQ/OiBTVkdFbGVtZW50O1xuICBfc3ZnOiBTVkdFbGVtZW50O1xuICBfdHlwZTogRG90VHlwZTtcblxuICBjb25zdHJ1Y3Rvcih7IHN2ZywgdHlwZSB9OiB7IHN2ZzogU1ZHRWxlbWVudDsgdHlwZTogRG90VHlwZSB9KSB7XG4gICAgdGhpcy5fc3ZnID0gc3ZnO1xuICAgIHRoaXMuX3R5cGUgPSB0eXBlO1xuICB9XG5cbiAgZHJhdyh4OiBudW1iZXIsIHk6IG51bWJlciwgc2l6ZTogbnVtYmVyLCBnZXROZWlnaGJvcjogR2V0TmVpZ2hib3IpOiB2b2lkIHtcbiAgICBjb25zdCB0eXBlID0gdGhpcy5fdHlwZTtcbiAgICBsZXQgZHJhd0Z1bmN0aW9uO1xuXG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlIGRvdFR5cGVzLmRvdHM6XG4gICAgICAgIGRyYXdGdW5jdGlvbiA9IHRoaXMuX2RyYXdEb3Q7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBkb3RUeXBlcy5yYW5kb21Eb3RzOlxuICAgICAgICBkcmF3RnVuY3Rpb24gPSB0aGlzLl9kcmF3UmFuZG9tRG90O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgZG90VHlwZXMuY2xhc3N5OlxuICAgICAgICBkcmF3RnVuY3Rpb24gPSB0aGlzLl9kcmF3Q2xhc3N5O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgZG90VHlwZXMuY2xhc3N5Um91bmRlZDpcbiAgICAgICAgZHJhd0Z1bmN0aW9uID0gdGhpcy5fZHJhd0NsYXNzeVJvdW5kZWQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBkb3RUeXBlcy5yb3VuZGVkOlxuICAgICAgICBkcmF3RnVuY3Rpb24gPSB0aGlzLl9kcmF3Um91bmRlZDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGRvdFR5cGVzLnZlcnRpY2FsTGluZXM6XG4gICAgICAgIGRyYXdGdW5jdGlvbiA9IHRoaXMuX2RyYXdWZXJ0aWNhbExpbmVzO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgZG90VHlwZXMuaG9yaXpvbnRhbExpbmVzOlxuICAgICAgICBkcmF3RnVuY3Rpb24gPSB0aGlzLl9kcmF3SG9yaXpvbnRhbExpbmVzO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgZG90VHlwZXMuZXh0cmFSb3VuZGVkOlxuICAgICAgICBkcmF3RnVuY3Rpb24gPSB0aGlzLl9kcmF3RXh0cmFSb3VuZGVkO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgZG90VHlwZXMuc3F1YXJlOlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgZHJhd0Z1bmN0aW9uID0gdGhpcy5fZHJhd1NxdWFyZTtcbiAgICB9XG5cbiAgICBkcmF3RnVuY3Rpb24uY2FsbCh0aGlzLCB7IHgsIHksIHNpemUsIGdldE5laWdoYm9yIH0pO1xuICB9XG5cbiAgX3JvdGF0ZUZpZ3VyZSh7IHgsIHksIHNpemUsIHJvdGF0aW9uID0gMCwgZHJhdyB9OiBSb3RhdGVGaWd1cmVBcmdzKTogdm9pZCB7XG4gICAgY29uc3QgY3ggPSB4ICsgc2l6ZSAvIDI7XG4gICAgY29uc3QgY3kgPSB5ICsgc2l6ZSAvIDI7XG5cbiAgICBkcmF3KCk7XG4gICAgdGhpcy5fZWxlbWVudD8uc2V0QXR0cmlidXRlKFwidHJhbnNmb3JtXCIsIGByb3RhdGUoJHsoMTgwICogcm90YXRpb24pIC8gTWF0aC5QSX0sJHtjeH0sJHtjeX0pYCk7XG4gIH1cblxuICBfYmFzaWNEb3QoYXJnczogQmFzaWNGaWd1cmVEcmF3QXJncyk6IHZvaWQge1xuICAgIGNvbnN0IHsgc2l6ZSwgeCwgeSB9ID0gYXJncztcblxuICAgIHRoaXMuX3JvdGF0ZUZpZ3VyZSh7XG4gICAgICAuLi5hcmdzLFxuICAgICAgZHJhdzogKCkgPT4ge1xuICAgICAgICB0aGlzLl9lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJjaXJjbGVcIik7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKFwiY3hcIiwgU3RyaW5nKHggKyBzaXplIC8gMikpO1xuICAgICAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShcImN5XCIsIFN0cmluZyh5ICsgc2l6ZSAvIDIpKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJyXCIsIFN0cmluZyhzaXplIC8gMikpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgX2Jhc2ljU3F1YXJlKGFyZ3M6IEJhc2ljRmlndXJlRHJhd0FyZ3MpOiB2b2lkIHtcbiAgICBjb25zdCB7IHNpemUsIHgsIHkgfSA9IGFyZ3M7XG5cbiAgICB0aGlzLl9yb3RhdGVGaWd1cmUoe1xuICAgICAgLi4uYXJncyxcbiAgICAgIGRyYXc6ICgpID0+IHtcbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwicmVjdFwiKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJ4XCIsIFN0cmluZyh4KSk7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKFwieVwiLCBTdHJpbmcoeSkpO1xuICAgICAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShcIndpZHRoXCIsIFN0cmluZyhzaXplKSk7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKFwiaGVpZ2h0XCIsIFN0cmluZyhzaXplKSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvL2lmIHJvdGF0aW9uID09PSAwIC0gcmlnaHQgc2lkZSBpcyByb3VuZGVkXG4gIF9iYXNpY1NpZGVSb3VuZGVkKGFyZ3M6IEJhc2ljRmlndXJlRHJhd0FyZ3MpOiB2b2lkIHtcbiAgICBjb25zdCB7IHNpemUsIHgsIHkgfSA9IGFyZ3M7XG5cbiAgICB0aGlzLl9yb3RhdGVGaWd1cmUoe1xuICAgICAgLi4uYXJncyxcbiAgICAgIGRyYXc6ICgpID0+IHtcbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwicGF0aFwiKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoXG4gICAgICAgICAgXCJkXCIsXG4gICAgICAgICAgYE0gJHt4fSAke3l9YCArIC8vZ28gdG8gdG9wIGxlZnQgcG9zaXRpb25cbiAgICAgICAgICAgIGB2ICR7c2l6ZX1gICsgLy9kcmF3IGxpbmUgdG8gbGVmdCBib3R0b20gY29ybmVyXG4gICAgICAgICAgICBgaCAke3NpemUgLyAyfWAgKyAvL2RyYXcgbGluZSB0byBsZWZ0IGJvdHRvbSBjb3JuZXIgKyBoYWxmIG9mIHNpemUgcmlnaHRcbiAgICAgICAgICAgIGBhICR7c2l6ZSAvIDJ9ICR7c2l6ZSAvIDJ9LCAwLCAwLCAwLCAwICR7LXNpemV9YCAvLyBkcmF3IHJvdW5kZWQgY29ybmVyXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvL2lmIHJvdGF0aW9uID09PSAwIC0gdG9wIHJpZ2h0IGNvcm5lciBpcyByb3VuZGVkXG4gIF9iYXNpY0Nvcm5lclJvdW5kZWQoYXJnczogQmFzaWNGaWd1cmVEcmF3QXJncyk6IHZvaWQge1xuICAgIGNvbnN0IHsgc2l6ZSwgeCwgeSB9ID0gYXJncztcblxuICAgIHRoaXMuX3JvdGF0ZUZpZ3VyZSh7XG4gICAgICAuLi5hcmdzLFxuICAgICAgZHJhdzogKCkgPT4ge1xuICAgICAgICB0aGlzLl9lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJwYXRoXCIpO1xuICAgICAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShcbiAgICAgICAgICBcImRcIixcbiAgICAgICAgICBgTSAke3h9ICR7eX1gICsgLy9nbyB0byB0b3AgbGVmdCBwb3NpdGlvblxuICAgICAgICAgICAgYHYgJHtzaXplfWAgKyAvL2RyYXcgbGluZSB0byBsZWZ0IGJvdHRvbSBjb3JuZXJcbiAgICAgICAgICAgIGBoICR7c2l6ZX1gICsgLy9kcmF3IGxpbmUgdG8gcmlnaHQgYm90dG9tIGNvcm5lclxuICAgICAgICAgICAgYHYgJHstc2l6ZSAvIDJ9YCArIC8vZHJhdyBsaW5lIHRvIHJpZ2h0IGJvdHRvbSBjb3JuZXIgKyBoYWxmIG9mIHNpemUgdG9wXG4gICAgICAgICAgICBgYSAke3NpemUgLyAyfSAke3NpemUgLyAyfSwgMCwgMCwgMCwgJHstc2l6ZSAvIDJ9ICR7LXNpemUgLyAyfWAgLy8gZHJhdyByb3VuZGVkIGNvcm5lclxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLy9pZiByb3RhdGlvbiA9PT0gMCAtIHRvcCByaWdodCBjb3JuZXIgaXMgcm91bmRlZFxuICBfYmFzaWNDb3JuZXJFeHRyYVJvdW5kZWQoYXJnczogQmFzaWNGaWd1cmVEcmF3QXJncyk6IHZvaWQge1xuICAgIGNvbnN0IHsgc2l6ZSwgeCwgeSB9ID0gYXJncztcblxuICAgIHRoaXMuX3JvdGF0ZUZpZ3VyZSh7XG4gICAgICAuLi5hcmdzLFxuICAgICAgZHJhdzogKCkgPT4ge1xuICAgICAgICB0aGlzLl9lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJwYXRoXCIpO1xuICAgICAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShcbiAgICAgICAgICBcImRcIixcbiAgICAgICAgICBgTSAke3h9ICR7eX1gICsgLy9nbyB0byB0b3AgbGVmdCBwb3NpdGlvblxuICAgICAgICAgICAgYHYgJHtzaXplfWAgKyAvL2RyYXcgbGluZSB0byBsZWZ0IGJvdHRvbSBjb3JuZXJcbiAgICAgICAgICAgIGBoICR7c2l6ZX1gICsgLy9kcmF3IGxpbmUgdG8gcmlnaHQgYm90dG9tIGNvcm5lclxuICAgICAgICAgICAgYGEgJHtzaXplfSAke3NpemV9LCAwLCAwLCAwLCAkey1zaXplfSAkey1zaXplfWAgLy8gZHJhdyByb3VuZGVkIHRvcCByaWdodCBjb3JuZXJcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8vaWYgcm90YXRpb24gPT09IDAgLSBsZWZ0IGJvdHRvbSBhbmQgcmlnaHQgdG9wIGNvcm5lcnMgYXJlIHJvdW5kZWRcbiAgX2Jhc2ljQ29ybmVyc1JvdW5kZWQoYXJnczogQmFzaWNGaWd1cmVEcmF3QXJncyk6IHZvaWQge1xuICAgIGNvbnN0IHsgc2l6ZSwgeCwgeSB9ID0gYXJncztcblxuICAgIHRoaXMuX3JvdGF0ZUZpZ3VyZSh7XG4gICAgICAuLi5hcmdzLFxuICAgICAgZHJhdzogKCkgPT4ge1xuICAgICAgICB0aGlzLl9lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJwYXRoXCIpO1xuICAgICAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShcbiAgICAgICAgICBcImRcIixcbiAgICAgICAgICBgTSAke3h9ICR7eX1gICsgLy9nbyB0byBsZWZ0IHRvcCBwb3NpdGlvblxuICAgICAgICAgICAgYHYgJHtzaXplIC8gMn1gICsgLy9kcmF3IGxpbmUgdG8gbGVmdCB0b3AgY29ybmVyICsgaGFsZiBvZiBzaXplIGJvdHRvbVxuICAgICAgICAgICAgYGEgJHtzaXplIC8gMn0gJHtzaXplIC8gMn0sIDAsIDAsIDAsICR7c2l6ZSAvIDJ9ICR7c2l6ZSAvIDJ9YCArIC8vIGRyYXcgcm91bmRlZCBsZWZ0IGJvdHRvbSBjb3JuZXJcbiAgICAgICAgICAgIGBoICR7c2l6ZSAvIDJ9YCArIC8vZHJhdyBsaW5lIHRvIHJpZ2h0IGJvdHRvbSBjb3JuZXJcbiAgICAgICAgICAgIGB2ICR7LXNpemUgLyAyfWAgKyAvL2RyYXcgbGluZSB0byByaWdodCBib3R0b20gY29ybmVyICsgaGFsZiBvZiBzaXplIHRvcFxuICAgICAgICAgICAgYGEgJHtzaXplIC8gMn0gJHtzaXplIC8gMn0sIDAsIDAsIDAsICR7LXNpemUgLyAyfSAkey1zaXplIC8gMn1gIC8vIGRyYXcgcm91bmRlZCByaWdodCB0b3AgY29ybmVyXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBfZHJhd0RvdCh7IHgsIHksIHNpemUgfTogRHJhd0FyZ3MpOiB2b2lkIHtcbiAgICB0aGlzLl9iYXNpY0RvdCh7IHgsIHksIHNpemUsIHJvdGF0aW9uOiAwIH0pO1xuICB9XG5cbiAgX2RyYXdSYW5kb21Eb3QoeyB4LCB5LCBzaXplIH06IERyYXdBcmdzKTogdm9pZCB7XG4gICAgY29uc3QgcmFuZG9tRmFjdG9yID0gTWF0aC5yYW5kb20oKSAqICgxIC0gMC42KSArIDAuNjtcbiAgICB0aGlzLl9iYXNpY0RvdCh7IHgsIHksIHNpemU6IHNpemUgKiByYW5kb21GYWN0b3IsIHJvdGF0aW9uOiAwIH0pO1xuICB9XG5cbiAgX2RyYXdTcXVhcmUoeyB4LCB5LCBzaXplIH06IERyYXdBcmdzKTogdm9pZCB7XG4gICAgdGhpcy5fYmFzaWNTcXVhcmUoeyB4LCB5LCBzaXplLCByb3RhdGlvbjogMCB9KTtcbiAgfVxuXG4gIF9kcmF3Um91bmRlZCh7IHgsIHksIHNpemUsIGdldE5laWdoYm9yIH06IERyYXdBcmdzKTogdm9pZCB7XG4gICAgY29uc3QgbGVmdE5laWdoYm9yID0gZ2V0TmVpZ2hib3IgPyArZ2V0TmVpZ2hib3IoLTEsIDApIDogMDtcbiAgICBjb25zdCByaWdodE5laWdoYm9yID0gZ2V0TmVpZ2hib3IgPyArZ2V0TmVpZ2hib3IoMSwgMCkgOiAwO1xuICAgIGNvbnN0IHRvcE5laWdoYm9yID0gZ2V0TmVpZ2hib3IgPyArZ2V0TmVpZ2hib3IoMCwgLTEpIDogMDtcbiAgICBjb25zdCBib3R0b21OZWlnaGJvciA9IGdldE5laWdoYm9yID8gK2dldE5laWdoYm9yKDAsIDEpIDogMDtcblxuICAgIGNvbnN0IG5laWdoYm9yc0NvdW50ID0gbGVmdE5laWdoYm9yICsgcmlnaHROZWlnaGJvciArIHRvcE5laWdoYm9yICsgYm90dG9tTmVpZ2hib3I7XG5cbiAgICBpZiAobmVpZ2hib3JzQ291bnQgPT09IDApIHtcbiAgICAgIHRoaXMuX2Jhc2ljRG90KHsgeCwgeSwgc2l6ZSwgcm90YXRpb246IDAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG5laWdoYm9yc0NvdW50ID4gMiB8fCAobGVmdE5laWdoYm9yICYmIHJpZ2h0TmVpZ2hib3IpIHx8ICh0b3BOZWlnaGJvciAmJiBib3R0b21OZWlnaGJvcikpIHtcbiAgICAgIHRoaXMuX2Jhc2ljU3F1YXJlKHsgeCwgeSwgc2l6ZSwgcm90YXRpb246IDAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG5laWdoYm9yc0NvdW50ID09PSAyKSB7XG4gICAgICBsZXQgcm90YXRpb24gPSAwO1xuXG4gICAgICBpZiAobGVmdE5laWdoYm9yICYmIHRvcE5laWdoYm9yKSB7XG4gICAgICAgIHJvdGF0aW9uID0gTWF0aC5QSSAvIDI7XG4gICAgICB9IGVsc2UgaWYgKHRvcE5laWdoYm9yICYmIHJpZ2h0TmVpZ2hib3IpIHtcbiAgICAgICAgcm90YXRpb24gPSBNYXRoLlBJO1xuICAgICAgfSBlbHNlIGlmIChyaWdodE5laWdoYm9yICYmIGJvdHRvbU5laWdoYm9yKSB7XG4gICAgICAgIHJvdGF0aW9uID0gLU1hdGguUEkgLyAyO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9iYXNpY0Nvcm5lclJvdW5kZWQoeyB4LCB5LCBzaXplLCByb3RhdGlvbiB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAobmVpZ2hib3JzQ291bnQgPT09IDEpIHtcbiAgICAgIGxldCByb3RhdGlvbiA9IDA7XG5cbiAgICAgIGlmICh0b3BOZWlnaGJvcikge1xuICAgICAgICByb3RhdGlvbiA9IE1hdGguUEkgLyAyO1xuICAgICAgfSBlbHNlIGlmIChyaWdodE5laWdoYm9yKSB7XG4gICAgICAgIHJvdGF0aW9uID0gTWF0aC5QSTtcbiAgICAgIH0gZWxzZSBpZiAoYm90dG9tTmVpZ2hib3IpIHtcbiAgICAgICAgcm90YXRpb24gPSAtTWF0aC5QSSAvIDI7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2Jhc2ljU2lkZVJvdW5kZWQoeyB4LCB5LCBzaXplLCByb3RhdGlvbiB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cblxuICBfZHJhd1ZlcnRpY2FsTGluZXMoeyB4LCB5LCBzaXplLCBnZXROZWlnaGJvciB9OiBEcmF3QXJncyk6IHZvaWQge1xuICAgIGNvbnN0IGxlZnROZWlnaGJvciA9IGdldE5laWdoYm9yID8gK2dldE5laWdoYm9yKC0xLCAwKSA6IDA7XG4gICAgY29uc3QgcmlnaHROZWlnaGJvciA9IGdldE5laWdoYm9yID8gK2dldE5laWdoYm9yKDEsIDApIDogMDtcbiAgICBjb25zdCB0b3BOZWlnaGJvciA9IGdldE5laWdoYm9yID8gK2dldE5laWdoYm9yKDAsIC0xKSA6IDA7XG4gICAgY29uc3QgYm90dG9tTmVpZ2hib3IgPSBnZXROZWlnaGJvciA/ICtnZXROZWlnaGJvcigwLCAxKSA6IDA7XG5cbiAgICBjb25zdCBuZWlnaGJvcnNDb3VudCA9IGxlZnROZWlnaGJvciArIHJpZ2h0TmVpZ2hib3IgKyB0b3BOZWlnaGJvciArIGJvdHRvbU5laWdoYm9yO1xuXG4gICAgaWYgKFxuICAgICAgbmVpZ2hib3JzQ291bnQgPT09IDAgfHxcbiAgICAgIChsZWZ0TmVpZ2hib3IgJiYgISh0b3BOZWlnaGJvciB8fCBib3R0b21OZWlnaGJvcikpIHx8XG4gICAgICAocmlnaHROZWlnaGJvciAmJiAhKHRvcE5laWdoYm9yIHx8IGJvdHRvbU5laWdoYm9yKSlcbiAgICApIHtcbiAgICAgIHRoaXMuX2Jhc2ljRG90KHsgeCwgeSwgc2l6ZSwgcm90YXRpb246IDAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRvcE5laWdoYm9yICYmIGJvdHRvbU5laWdoYm9yKSB7XG4gICAgICB0aGlzLl9iYXNpY1NxdWFyZSh7IHgsIHksIHNpemUsIHJvdGF0aW9uOiAwIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0b3BOZWlnaGJvciAmJiAhYm90dG9tTmVpZ2hib3IpIHtcbiAgICAgIGNvbnN0IHJvdGF0aW9uID0gTWF0aC5QSSAvIDI7XG4gICAgICB0aGlzLl9iYXNpY1NpZGVSb3VuZGVkKHsgeCwgeSwgc2l6ZSwgcm90YXRpb24gfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGJvdHRvbU5laWdoYm9yICYmICF0b3BOZWlnaGJvcikge1xuICAgICAgY29uc3Qgcm90YXRpb24gPSAtTWF0aC5QSSAvIDI7XG4gICAgICB0aGlzLl9iYXNpY1NpZGVSb3VuZGVkKHsgeCwgeSwgc2l6ZSwgcm90YXRpb24gfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG5cbiAgX2RyYXdIb3Jpem9udGFsTGluZXMoeyB4LCB5LCBzaXplLCBnZXROZWlnaGJvciB9OiBEcmF3QXJncyk6IHZvaWQge1xuICAgIGNvbnN0IGxlZnROZWlnaGJvciA9IGdldE5laWdoYm9yID8gK2dldE5laWdoYm9yKC0xLCAwKSA6IDA7XG4gICAgY29uc3QgcmlnaHROZWlnaGJvciA9IGdldE5laWdoYm9yID8gK2dldE5laWdoYm9yKDEsIDApIDogMDtcbiAgICBjb25zdCB0b3BOZWlnaGJvciA9IGdldE5laWdoYm9yID8gK2dldE5laWdoYm9yKDAsIC0xKSA6IDA7XG4gICAgY29uc3QgYm90dG9tTmVpZ2hib3IgPSBnZXROZWlnaGJvciA/ICtnZXROZWlnaGJvcigwLCAxKSA6IDA7XG5cbiAgICBjb25zdCBuZWlnaGJvcnNDb3VudCA9IGxlZnROZWlnaGJvciArIHJpZ2h0TmVpZ2hib3IgKyB0b3BOZWlnaGJvciArIGJvdHRvbU5laWdoYm9yO1xuXG4gICAgaWYgKFxuICAgICAgbmVpZ2hib3JzQ291bnQgPT09IDAgfHxcbiAgICAgICh0b3BOZWlnaGJvciAmJiAhKGxlZnROZWlnaGJvciB8fCByaWdodE5laWdoYm9yKSkgfHxcbiAgICAgIChib3R0b21OZWlnaGJvciAmJiAhKGxlZnROZWlnaGJvciB8fCByaWdodE5laWdoYm9yKSlcbiAgICApIHtcbiAgICAgIHRoaXMuX2Jhc2ljRG90KHsgeCwgeSwgc2l6ZSwgcm90YXRpb246IDAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGxlZnROZWlnaGJvciAmJiByaWdodE5laWdoYm9yKSB7XG4gICAgICB0aGlzLl9iYXNpY1NxdWFyZSh7IHgsIHksIHNpemUsIHJvdGF0aW9uOiAwIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChsZWZ0TmVpZ2hib3IgJiYgIXJpZ2h0TmVpZ2hib3IpIHtcbiAgICAgIGNvbnN0IHJvdGF0aW9uID0gMDtcbiAgICAgIHRoaXMuX2Jhc2ljU2lkZVJvdW5kZWQoeyB4LCB5LCBzaXplLCByb3RhdGlvbiB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAocmlnaHROZWlnaGJvciAmJiAhbGVmdE5laWdoYm9yKSB7XG4gICAgICBjb25zdCByb3RhdGlvbiA9IE1hdGguUEk7XG4gICAgICB0aGlzLl9iYXNpY1NpZGVSb3VuZGVkKHsgeCwgeSwgc2l6ZSwgcm90YXRpb24gfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG5cbiAgX2RyYXdFeHRyYVJvdW5kZWQoeyB4LCB5LCBzaXplLCBnZXROZWlnaGJvciB9OiBEcmF3QXJncyk6IHZvaWQge1xuICAgIGNvbnN0IGxlZnROZWlnaGJvciA9IGdldE5laWdoYm9yID8gK2dldE5laWdoYm9yKC0xLCAwKSA6IDA7XG4gICAgY29uc3QgcmlnaHROZWlnaGJvciA9IGdldE5laWdoYm9yID8gK2dldE5laWdoYm9yKDEsIDApIDogMDtcbiAgICBjb25zdCB0b3BOZWlnaGJvciA9IGdldE5laWdoYm9yID8gK2dldE5laWdoYm9yKDAsIC0xKSA6IDA7XG4gICAgY29uc3QgYm90dG9tTmVpZ2hib3IgPSBnZXROZWlnaGJvciA/ICtnZXROZWlnaGJvcigwLCAxKSA6IDA7XG5cbiAgICBjb25zdCBuZWlnaGJvcnNDb3VudCA9IGxlZnROZWlnaGJvciArIHJpZ2h0TmVpZ2hib3IgKyB0b3BOZWlnaGJvciArIGJvdHRvbU5laWdoYm9yO1xuXG4gICAgaWYgKG5laWdoYm9yc0NvdW50ID09PSAwKSB7XG4gICAgICB0aGlzLl9iYXNpY0RvdCh7IHgsIHksIHNpemUsIHJvdGF0aW9uOiAwIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChuZWlnaGJvcnNDb3VudCA+IDIgfHwgKGxlZnROZWlnaGJvciAmJiByaWdodE5laWdoYm9yKSB8fCAodG9wTmVpZ2hib3IgJiYgYm90dG9tTmVpZ2hib3IpKSB7XG4gICAgICB0aGlzLl9iYXNpY1NxdWFyZSh7IHgsIHksIHNpemUsIHJvdGF0aW9uOiAwIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChuZWlnaGJvcnNDb3VudCA9PT0gMikge1xuICAgICAgbGV0IHJvdGF0aW9uID0gMDtcblxuICAgICAgaWYgKGxlZnROZWlnaGJvciAmJiB0b3BOZWlnaGJvcikge1xuICAgICAgICByb3RhdGlvbiA9IE1hdGguUEkgLyAyO1xuICAgICAgfSBlbHNlIGlmICh0b3BOZWlnaGJvciAmJiByaWdodE5laWdoYm9yKSB7XG4gICAgICAgIHJvdGF0aW9uID0gTWF0aC5QSTtcbiAgICAgIH0gZWxzZSBpZiAocmlnaHROZWlnaGJvciAmJiBib3R0b21OZWlnaGJvcikge1xuICAgICAgICByb3RhdGlvbiA9IC1NYXRoLlBJIC8gMjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fYmFzaWNDb3JuZXJFeHRyYVJvdW5kZWQoeyB4LCB5LCBzaXplLCByb3RhdGlvbiB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAobmVpZ2hib3JzQ291bnQgPT09IDEpIHtcbiAgICAgIGxldCByb3RhdGlvbiA9IDA7XG5cbiAgICAgIGlmICh0b3BOZWlnaGJvcikge1xuICAgICAgICByb3RhdGlvbiA9IE1hdGguUEkgLyAyO1xuICAgICAgfSBlbHNlIGlmIChyaWdodE5laWdoYm9yKSB7XG4gICAgICAgIHJvdGF0aW9uID0gTWF0aC5QSTtcbiAgICAgIH0gZWxzZSBpZiAoYm90dG9tTmVpZ2hib3IpIHtcbiAgICAgICAgcm90YXRpb24gPSAtTWF0aC5QSSAvIDI7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2Jhc2ljU2lkZVJvdW5kZWQoeyB4LCB5LCBzaXplLCByb3RhdGlvbiB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cblxuICBfZHJhd0NsYXNzeSh7IHgsIHksIHNpemUsIGdldE5laWdoYm9yIH06IERyYXdBcmdzKTogdm9pZCB7XG4gICAgY29uc3QgbGVmdE5laWdoYm9yID0gZ2V0TmVpZ2hib3IgPyArZ2V0TmVpZ2hib3IoLTEsIDApIDogMDtcbiAgICBjb25zdCByaWdodE5laWdoYm9yID0gZ2V0TmVpZ2hib3IgPyArZ2V0TmVpZ2hib3IoMSwgMCkgOiAwO1xuICAgIGNvbnN0IHRvcE5laWdoYm9yID0gZ2V0TmVpZ2hib3IgPyArZ2V0TmVpZ2hib3IoMCwgLTEpIDogMDtcbiAgICBjb25zdCBib3R0b21OZWlnaGJvciA9IGdldE5laWdoYm9yID8gK2dldE5laWdoYm9yKDAsIDEpIDogMDtcblxuICAgIGNvbnN0IG5laWdoYm9yc0NvdW50ID0gbGVmdE5laWdoYm9yICsgcmlnaHROZWlnaGJvciArIHRvcE5laWdoYm9yICsgYm90dG9tTmVpZ2hib3I7XG5cbiAgICBpZiAobmVpZ2hib3JzQ291bnQgPT09IDApIHtcbiAgICAgIHRoaXMuX2Jhc2ljQ29ybmVyc1JvdW5kZWQoeyB4LCB5LCBzaXplLCByb3RhdGlvbjogTWF0aC5QSSAvIDIgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCFsZWZ0TmVpZ2hib3IgJiYgIXRvcE5laWdoYm9yKSB7XG4gICAgICB0aGlzLl9iYXNpY0Nvcm5lclJvdW5kZWQoeyB4LCB5LCBzaXplLCByb3RhdGlvbjogLU1hdGguUEkgLyAyIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghcmlnaHROZWlnaGJvciAmJiAhYm90dG9tTmVpZ2hib3IpIHtcbiAgICAgIHRoaXMuX2Jhc2ljQ29ybmVyUm91bmRlZCh7IHgsIHksIHNpemUsIHJvdGF0aW9uOiBNYXRoLlBJIC8gMiB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9iYXNpY1NxdWFyZSh7IHgsIHksIHNpemUsIHJvdGF0aW9uOiAwIH0pO1xuICB9XG5cbiAgX2RyYXdDbGFzc3lSb3VuZGVkKHsgeCwgeSwgc2l6ZSwgZ2V0TmVpZ2hib3IgfTogRHJhd0FyZ3MpOiB2b2lkIHtcbiAgICBjb25zdCBsZWZ0TmVpZ2hib3IgPSBnZXROZWlnaGJvciA/ICtnZXROZWlnaGJvcigtMSwgMCkgOiAwO1xuICAgIGNvbnN0IHJpZ2h0TmVpZ2hib3IgPSBnZXROZWlnaGJvciA/ICtnZXROZWlnaGJvcigxLCAwKSA6IDA7XG4gICAgY29uc3QgdG9wTmVpZ2hib3IgPSBnZXROZWlnaGJvciA/ICtnZXROZWlnaGJvcigwLCAtMSkgOiAwO1xuICAgIGNvbnN0IGJvdHRvbU5laWdoYm9yID0gZ2V0TmVpZ2hib3IgPyArZ2V0TmVpZ2hib3IoMCwgMSkgOiAwO1xuXG4gICAgY29uc3QgbmVpZ2hib3JzQ291bnQgPSBsZWZ0TmVpZ2hib3IgKyByaWdodE5laWdoYm9yICsgdG9wTmVpZ2hib3IgKyBib3R0b21OZWlnaGJvcjtcblxuICAgIGlmIChuZWlnaGJvcnNDb3VudCA9PT0gMCkge1xuICAgICAgdGhpcy5fYmFzaWNDb3JuZXJzUm91bmRlZCh7IHgsIHksIHNpemUsIHJvdGF0aW9uOiBNYXRoLlBJIC8gMiB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIWxlZnROZWlnaGJvciAmJiAhdG9wTmVpZ2hib3IpIHtcbiAgICAgIHRoaXMuX2Jhc2ljQ29ybmVyRXh0cmFSb3VuZGVkKHsgeCwgeSwgc2l6ZSwgcm90YXRpb246IC1NYXRoLlBJIC8gMiB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIXJpZ2h0TmVpZ2hib3IgJiYgIWJvdHRvbU5laWdoYm9yKSB7XG4gICAgICB0aGlzLl9iYXNpY0Nvcm5lckV4dHJhUm91bmRlZCh7IHgsIHksIHNpemUsIHJvdGF0aW9uOiBNYXRoLlBJIC8gMiB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9iYXNpY1NxdWFyZSh7IHgsIHksIHNpemUsIHJvdGF0aW9uOiAwIH0pO1xuICB9XG59XG4iLCJleHBvcnQgZnVuY3Rpb24gY3JlYXRlSGVhcnRTVkcoc2l6ZTogbnVtYmVyLCBjb2xvcjogc3RyaW5nKTogU1ZHU1ZHRWxlbWVudCB7XG4gIGNvbnN0IHhtbG5zID0gXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiO1xuICBjb25zdCBzdmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoeG1sbnMsIFwic3ZnXCIpO1xuICBzdmcuc2V0QXR0cmlidXRlKFwid2lkdGhcIiwgc2l6ZS50b1N0cmluZygpKTtcbiAgc3ZnLnNldEF0dHJpYnV0ZShcImhlaWdodFwiLCBzaXplLnRvU3RyaW5nKCkpO1xuICBzdmcuc2V0QXR0cmlidXRlKFwidmlld0JveFwiLCBcIjAgLTk2MCA5NjAgOTYwXCIpO1xuICBzdmcuc2V0QXR0cmlidXRlKFwiZmlsbFwiLCBjb2xvcik7XG5cbiAgY29uc3QgcGF0aCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyh4bWxucywgXCJwYXRoXCIpO1xuICBwYXRoLnNldEF0dHJpYnV0ZShcbiAgICBcImRcIixcbiAgICBcIm00ODAtMTIwLTU4LTUycS0xMDEtOTEtMTY3LTE1N1QxNTAtNDQ3LjVRMTExLTUwMCA5NS41LTU0NFQ4MC02MzRxMC05NCA2My0xNTd0MTU3LTYzcTUyIDAgOTkgMjJ0ODEgNjJxMzQtNDAgODEtNjJ0OTktMjJxOTQgMCAxNTcgNjN0NjMgMTU3cTAgNDYtMTUuNSA5MFQ4MTAtNDQ3LjVRNzcxLTM5NSA3MDUtMzI5VDUzOC0xNzJsLTU4IDUyWlwiXG4gICk7XG4gIHN2Zy5hcHBlbmRDaGlsZChwYXRoKTtcbiAgcmV0dXJuIHN2Zztcbn1cbiIsImludGVyZmFjZSBJbWFnZVNpemVPcHRpb25zIHtcbiAgb3JpZ2luYWxIZWlnaHQ6IG51bWJlcjtcbiAgb3JpZ2luYWxXaWR0aDogbnVtYmVyO1xuICBtYXhIaWRkZW5Eb3RzOiBudW1iZXI7XG4gIG1heEhpZGRlbkF4aXNEb3RzPzogbnVtYmVyO1xuICBkb3RTaXplOiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBJbWFnZVNpemVSZXN1bHQge1xuICBoZWlnaHQ6IG51bWJlcjtcbiAgd2lkdGg6IG51bWJlcjtcbiAgaGlkZVlEb3RzOiBudW1iZXI7XG4gIGhpZGVYRG90czogbnVtYmVyO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjYWxjdWxhdGVJbWFnZVNpemUoe1xuICBvcmlnaW5hbEhlaWdodCxcbiAgb3JpZ2luYWxXaWR0aCxcbiAgbWF4SGlkZGVuRG90cyxcbiAgbWF4SGlkZGVuQXhpc0RvdHMsXG4gIGRvdFNpemVcbn06IEltYWdlU2l6ZU9wdGlvbnMpOiBJbWFnZVNpemVSZXN1bHQge1xuICBjb25zdCBoaWRlRG90cyA9IHsgeDogMCwgeTogMCB9O1xuICBjb25zdCBpbWFnZVNpemUgPSB7IHg6IDAsIHk6IDAgfTtcblxuICBpZiAob3JpZ2luYWxIZWlnaHQgPD0gMCB8fCBvcmlnaW5hbFdpZHRoIDw9IDAgfHwgbWF4SGlkZGVuRG90cyA8PSAwIHx8IGRvdFNpemUgPD0gMCkge1xuICAgIHJldHVybiB7XG4gICAgICBoZWlnaHQ6IDAsXG4gICAgICB3aWR0aDogMCxcbiAgICAgIGhpZGVZRG90czogMCxcbiAgICAgIGhpZGVYRG90czogMFxuICAgIH07XG4gIH1cblxuICBjb25zdCBrID0gb3JpZ2luYWxIZWlnaHQgLyBvcmlnaW5hbFdpZHRoO1xuXG4gIC8vR2V0dGluZyB0aGUgbWF4aW11bSBwb3NzaWJsZSBheGlzIGhpZGRlbiBkb3RzXG4gIGhpZGVEb3RzLnggPSBNYXRoLmZsb29yKE1hdGguc3FydChtYXhIaWRkZW5Eb3RzIC8gaykpO1xuICAvL1RoZSBjb3VudCBvZiBoaWRkZW4gZG90J3MgY2FuJ3QgYmUgbGVzcyB0aGFuIDFcbiAgaWYgKGhpZGVEb3RzLnggPD0gMCkgaGlkZURvdHMueCA9IDE7XG4gIC8vQ2hlY2sgdGhlIGxpbWl0IG9mIHRoZSBtYXhpbXVtIGFsbG93ZWQgYXhpcyBoaWRkZW4gZG90c1xuICBpZiAobWF4SGlkZGVuQXhpc0RvdHMgJiYgbWF4SGlkZGVuQXhpc0RvdHMgPCBoaWRlRG90cy54KSBoaWRlRG90cy54ID0gbWF4SGlkZGVuQXhpc0RvdHM7XG4gIC8vVGhlIGNvdW50IG9mIGRvdHMgc2hvdWxkIGJlIG9kZFxuICBpZiAoaGlkZURvdHMueCAlIDIgPT09IDApIGhpZGVEb3RzLngtLTtcbiAgaW1hZ2VTaXplLnggPSBoaWRlRG90cy54ICogZG90U2l6ZTtcbiAgLy9DYWxjdWxhdGUgb3Bwb3NpdGUgYXhpcyBoaWRkZW4gZG90cyBiYXNlZCBvbiBheGlzIHZhbHVlLlxuICAvL1RoZSB2YWx1ZSB3aWxsIGJlIG9kZC5cbiAgLy9XZSB1c2UgY2VpbCB0byBwcmV2ZW50IGRvdHMgY292ZXJpbmcgYnkgdGhlIGltYWdlLlxuICBoaWRlRG90cy55ID0gMSArIDIgKiBNYXRoLmNlaWwoKGhpZGVEb3RzLnggKiBrIC0gMSkgLyAyKTtcbiAgaW1hZ2VTaXplLnkgPSBNYXRoLnJvdW5kKGltYWdlU2l6ZS54ICogayk7XG4gIC8vSWYgdGhlIHJlc3VsdCBkb3RzIGNvdW50IGlzIGJpZ2dlciB0aGFuIG1heCAtIHRoZW4gZGVjcmVhc2Ugc2l6ZSBhbmQgY2FsY3VsYXRlIGFnYWluXG4gIGlmIChoaWRlRG90cy55ICogaGlkZURvdHMueCA+IG1heEhpZGRlbkRvdHMgfHwgKG1heEhpZGRlbkF4aXNEb3RzICYmIG1heEhpZGRlbkF4aXNEb3RzIDwgaGlkZURvdHMueSkpIHtcbiAgICBpZiAobWF4SGlkZGVuQXhpc0RvdHMgJiYgbWF4SGlkZGVuQXhpc0RvdHMgPCBoaWRlRG90cy55KSB7XG4gICAgICBoaWRlRG90cy55ID0gbWF4SGlkZGVuQXhpc0RvdHM7XG4gICAgICBpZiAoaGlkZURvdHMueSAlIDIgPT09IDApIGhpZGVEb3RzLngtLTtcbiAgICB9IGVsc2Uge1xuICAgICAgaGlkZURvdHMueSAtPSAyO1xuICAgIH1cbiAgICBpbWFnZVNpemUueSA9IGhpZGVEb3RzLnkgKiBkb3RTaXplO1xuICAgIGhpZGVEb3RzLnggPSAxICsgMiAqIE1hdGguY2VpbCgoaGlkZURvdHMueSAvIGsgLSAxKSAvIDIpO1xuICAgIGltYWdlU2l6ZS54ID0gTWF0aC5yb3VuZChpbWFnZVNpemUueSAvIGspO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBoZWlnaHQ6IGltYWdlU2l6ZS55LFxuICAgIHdpZHRoOiBpbWFnZVNpemUueCxcbiAgICBoaWRlWURvdHM6IGhpZGVEb3RzLnksXG4gICAgaGlkZVhEb3RzOiBoaWRlRG90cy54XG4gIH07XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkb3dubG9hZFVSSSh1cmk6IHN0cmluZywgbmFtZTogc3RyaW5nKTogdm9pZCB7XG4gIGNvbnN0IGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcbiAgbGluay5kb3dubG9hZCA9IG5hbWU7XG4gIGxpbmsuaHJlZiA9IHVyaTtcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChsaW5rKTtcbiAgbGluay5jbGljaygpO1xuICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGxpbmspO1xufVxuIiwiaW1wb3J0IG1vZGVzIGZyb20gXCIuLi9jb25zdGFudHMvbW9kZXNcIjtcbmltcG9ydCB7IE1vZGUgfSBmcm9tIFwiLi4vdHlwZXNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0TW9kZShkYXRhOiBzdHJpbmcpOiBNb2RlIHtcbiAgc3dpdGNoICh0cnVlKSB7XG4gICAgY2FzZSAvXlswLTldKiQvLnRlc3QoZGF0YSk6XG4gICAgICByZXR1cm4gbW9kZXMubnVtZXJpYztcbiAgICBjYXNlIC9eWzAtOUEtWiAkJSorXFwtLi86XSokLy50ZXN0KGRhdGEpOlxuICAgICAgcmV0dXJuIG1vZGVzLmFscGhhbnVtZXJpYztcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIG1vZGVzLmJ5dGU7XG4gIH1cbn1cbiIsImltcG9ydCB7IFVua25vd25PYmplY3QgfSBmcm9tIFwiLi4vdHlwZXNcIjtcblxuY29uc3QgaXNPYmplY3QgPSAob2JqOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IGJvb2xlYW4gPT4gISFvYmogJiYgdHlwZW9mIG9iaiA9PT0gXCJvYmplY3RcIiAmJiAhQXJyYXkuaXNBcnJheShvYmopO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBtZXJnZURlZXAodGFyZ2V0OiBVbmtub3duT2JqZWN0LCAuLi5zb3VyY2VzOiBVbmtub3duT2JqZWN0W10pOiBVbmtub3duT2JqZWN0IHtcbiAgaWYgKCFzb3VyY2VzLmxlbmd0aCkgcmV0dXJuIHRhcmdldDtcbiAgY29uc3Qgc291cmNlID0gc291cmNlcy5zaGlmdCgpO1xuICBpZiAoc291cmNlID09PSB1bmRlZmluZWQgfHwgIWlzT2JqZWN0KHRhcmdldCkgfHwgIWlzT2JqZWN0KHNvdXJjZSkpIHJldHVybiB0YXJnZXQ7XG4gIHRhcmdldCA9IHsgLi4udGFyZ2V0IH07XG4gIE9iamVjdC5rZXlzKHNvdXJjZSkuZm9yRWFjaCgoa2V5OiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgICBjb25zdCB0YXJnZXRWYWx1ZSA9IHRhcmdldFtrZXldO1xuICAgIGNvbnN0IHNvdXJjZVZhbHVlID0gc291cmNlW2tleV07XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheSh0YXJnZXRWYWx1ZSkgJiYgQXJyYXkuaXNBcnJheShzb3VyY2VWYWx1ZSkpIHtcbiAgICAgIHRhcmdldFtrZXldID0gc291cmNlVmFsdWU7XG4gICAgfSBlbHNlIGlmIChpc09iamVjdCh0YXJnZXRWYWx1ZSkgJiYgaXNPYmplY3Qoc291cmNlVmFsdWUpKSB7XG4gICAgICB0YXJnZXRba2V5XSA9IG1lcmdlRGVlcChPYmplY3QuYXNzaWduKHt9LCB0YXJnZXRWYWx1ZSksIHNvdXJjZVZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGFyZ2V0W2tleV0gPSBzb3VyY2VWYWx1ZTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBtZXJnZURlZXAodGFyZ2V0LCAuLi5zb3VyY2VzKTtcbn1cbiIsImltcG9ydCB7IFJlcXVpcmVkT3B0aW9ucyB9IGZyb20gXCIuLi9jb3JlL1FST3B0aW9uc1wiO1xuaW1wb3J0IHsgR3JhZGllbnQgfSBmcm9tIFwiLi4vdHlwZXNcIjtcblxuZnVuY3Rpb24gc2FuaXRpemVHcmFkaWVudChncmFkaWVudDogR3JhZGllbnQpOiBHcmFkaWVudCB7XG4gIGNvbnN0IG5ld0dyYWRpZW50ID0geyAuLi5ncmFkaWVudCB9O1xuXG4gIGlmICghbmV3R3JhZGllbnQuY29sb3JTdG9wcyB8fCAhbmV3R3JhZGllbnQuY29sb3JTdG9wcy5sZW5ndGgpIHtcbiAgICB0aHJvdyBcIkZpZWxkICdjb2xvclN0b3BzJyBpcyByZXF1aXJlZCBpbiBncmFkaWVudFwiO1xuICB9XG5cbiAgaWYgKG5ld0dyYWRpZW50LnJvdGF0aW9uKSB7XG4gICAgbmV3R3JhZGllbnQucm90YXRpb24gPSBOdW1iZXIobmV3R3JhZGllbnQucm90YXRpb24pO1xuICB9IGVsc2Uge1xuICAgIG5ld0dyYWRpZW50LnJvdGF0aW9uID0gMDtcbiAgfVxuXG4gIG5ld0dyYWRpZW50LmNvbG9yU3RvcHMgPSBuZXdHcmFkaWVudC5jb2xvclN0b3BzLm1hcCgoY29sb3JTdG9wOiB7IG9mZnNldDogbnVtYmVyOyBjb2xvcjogc3RyaW5nIH0pID0+ICh7XG4gICAgLi4uY29sb3JTdG9wLFxuICAgIG9mZnNldDogTnVtYmVyKGNvbG9yU3RvcC5vZmZzZXQpXG4gIH0pKTtcblxuICByZXR1cm4gbmV3R3JhZGllbnQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHNhbml0aXplT3B0aW9ucyhvcHRpb25zOiBSZXF1aXJlZE9wdGlvbnMpOiBSZXF1aXJlZE9wdGlvbnMge1xuICBjb25zdCBuZXdPcHRpb25zID0geyAuLi5vcHRpb25zIH07XG5cbiAgbmV3T3B0aW9ucy53aWR0aCA9IE51bWJlcihuZXdPcHRpb25zLndpZHRoKTtcbiAgbmV3T3B0aW9ucy5oZWlnaHQgPSBOdW1iZXIobmV3T3B0aW9ucy5oZWlnaHQpO1xuICBuZXdPcHRpb25zLm1hcmdpbiA9IE51bWJlcihuZXdPcHRpb25zLm1hcmdpbik7XG4gIG5ld09wdGlvbnMuaW1hZ2VPcHRpb25zID0ge1xuICAgIC4uLm5ld09wdGlvbnMuaW1hZ2VPcHRpb25zLFxuICAgIGhpZGVCYWNrZ3JvdW5kRG90czogQm9vbGVhbihuZXdPcHRpb25zLmltYWdlT3B0aW9ucy5oaWRlQmFja2dyb3VuZERvdHMpLFxuICAgIGltYWdlU2l6ZTogTnVtYmVyKG5ld09wdGlvbnMuaW1hZ2VPcHRpb25zLmltYWdlU2l6ZSksXG4gICAgbWFyZ2luOiBOdW1iZXIobmV3T3B0aW9ucy5pbWFnZU9wdGlvbnMubWFyZ2luKVxuICB9O1xuXG4gIGlmIChuZXdPcHRpb25zLm1hcmdpbiA+IE1hdGgubWluKG5ld09wdGlvbnMud2lkdGgsIG5ld09wdGlvbnMuaGVpZ2h0KSkge1xuICAgIG5ld09wdGlvbnMubWFyZ2luID0gTWF0aC5taW4obmV3T3B0aW9ucy53aWR0aCwgbmV3T3B0aW9ucy5oZWlnaHQpO1xuICB9XG5cbiAgbmV3T3B0aW9ucy5kb3RzT3B0aW9ucyA9IHtcbiAgICAuLi5uZXdPcHRpb25zLmRvdHNPcHRpb25zXG4gIH07XG4gIGlmIChuZXdPcHRpb25zLmRvdHNPcHRpb25zLmdyYWRpZW50KSB7XG4gICAgbmV3T3B0aW9ucy5kb3RzT3B0aW9ucy5ncmFkaWVudCA9IHNhbml0aXplR3JhZGllbnQobmV3T3B0aW9ucy5kb3RzT3B0aW9ucy5ncmFkaWVudCk7XG4gIH1cblxuICBpZiAobmV3T3B0aW9ucy5jb3JuZXJzU3F1YXJlT3B0aW9ucykge1xuICAgIG5ld09wdGlvbnMuY29ybmVyc1NxdWFyZU9wdGlvbnMgPSB7XG4gICAgICAuLi5uZXdPcHRpb25zLmNvcm5lcnNTcXVhcmVPcHRpb25zXG4gICAgfTtcbiAgICBpZiAobmV3T3B0aW9ucy5jb3JuZXJzU3F1YXJlT3B0aW9ucy5ncmFkaWVudCkge1xuICAgICAgbmV3T3B0aW9ucy5jb3JuZXJzU3F1YXJlT3B0aW9ucy5ncmFkaWVudCA9IHNhbml0aXplR3JhZGllbnQobmV3T3B0aW9ucy5jb3JuZXJzU3F1YXJlT3B0aW9ucy5ncmFkaWVudCk7XG4gICAgfVxuICB9XG5cbiAgaWYgKG5ld09wdGlvbnMuY29ybmVyc0RvdE9wdGlvbnMpIHtcbiAgICBuZXdPcHRpb25zLmNvcm5lcnNEb3RPcHRpb25zID0ge1xuICAgICAgLi4ubmV3T3B0aW9ucy5jb3JuZXJzRG90T3B0aW9uc1xuICAgIH07XG4gICAgaWYgKG5ld09wdGlvbnMuY29ybmVyc0RvdE9wdGlvbnMuZ3JhZGllbnQpIHtcbiAgICAgIG5ld09wdGlvbnMuY29ybmVyc0RvdE9wdGlvbnMuZ3JhZGllbnQgPSBzYW5pdGl6ZUdyYWRpZW50KG5ld09wdGlvbnMuY29ybmVyc0RvdE9wdGlvbnMuZ3JhZGllbnQpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChuZXdPcHRpb25zLmJhY2tncm91bmRPcHRpb25zKSB7XG4gICAgbmV3T3B0aW9ucy5iYWNrZ3JvdW5kT3B0aW9ucyA9IHtcbiAgICAgIC4uLm5ld09wdGlvbnMuYmFja2dyb3VuZE9wdGlvbnNcbiAgICB9O1xuICAgIGlmIChuZXdPcHRpb25zLmJhY2tncm91bmRPcHRpb25zLmdyYWRpZW50KSB7XG4gICAgICBuZXdPcHRpb25zLmJhY2tncm91bmRPcHRpb25zLmdyYWRpZW50ID0gc2FuaXRpemVHcmFkaWVudChuZXdPcHRpb25zLmJhY2tncm91bmRPcHRpb25zLmdyYWRpZW50KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3T3B0aW9ucztcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIHRvRGF0YVVSTCh1cmw6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgIGNvbnN0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIHhoci5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zdCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgICAgcmVhZGVyLm9ubG9hZGVuZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmVzb2x2ZShyZWFkZXIucmVzdWx0IGFzIHN0cmluZyk7XG4gICAgICB9O1xuICAgICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoeGhyLnJlc3BvbnNlKTtcbiAgICB9O1xuICAgIHhoci5vcGVuKFwiR0VUXCIsIHVybCk7XG4gICAgeGhyLnJlc3BvbnNlVHlwZSA9IFwiYmxvYlwiO1xuICAgIHhoci5zZW5kKCk7XG4gIH0pO1xufVxuIiwiZXhwb3J0IGludGVyZmFjZSBVbmtub3duT2JqZWN0IHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgW2tleTogc3RyaW5nXTogYW55O1xufVxuXG5leHBvcnQgdHlwZSBEb3RUeXBlID1cbiAgfCBcImRvdHNcIlxuICB8IFwicmFuZG9tLWRvdHNcIlxuICB8IFwicm91bmRlZFwiXG4gIHwgXCJ2ZXJ0aWNhbC1saW5lc1wiXG4gIHwgXCJob3Jpem9udGFsLWxpbmVzXCJcbiAgfCBcImNsYXNzeVwiXG4gIHwgXCJjbGFzc3ktcm91bmRlZFwiXG4gIHwgXCJzcXVhcmVcIlxuICB8IFwiZXh0cmEtcm91bmRlZFwiO1xuZXhwb3J0IHR5cGUgQ29ybmVyRG90VHlwZSA9IFwiZG90XCIgfCBcInNxdWFyZVwiIHwgXCJoZWFydFwiIHwgXCJzdGFyXCI7XG5leHBvcnQgdHlwZSBDb3JuZXJTcXVhcmVUeXBlID0gXCJkb3RcIiB8IFwic3F1YXJlXCIgfCBcImV4dHJhLXJvdW5kZWRcIjtcbmV4cG9ydCB0eXBlIEZpbGVFeHRlbnNpb24gPSBcInN2Z1wiIHwgXCJwbmdcIiB8IFwianBlZ1wiIHwgXCJ3ZWJwXCI7XG5leHBvcnQgdHlwZSBHcmFkaWVudFR5cGUgPSBcInJhZGlhbFwiIHwgXCJsaW5lYXJcIjtcbmV4cG9ydCB0eXBlIERyYXdUeXBlID0gXCJjYW52YXNcIiB8IFwic3ZnXCI7XG5leHBvcnQgdHlwZSBTaGFwZVR5cGUgPSBcInNxdWFyZVwiIHwgXCJjaXJjbGVcIjtcblxuZXhwb3J0IHR5cGUgR3JhZGllbnQgPSB7XG4gIHR5cGU6IEdyYWRpZW50VHlwZTtcbiAgcm90YXRpb24/OiBudW1iZXI7XG4gIGNvbG9yU3RvcHM6IHtcbiAgICBvZmZzZXQ6IG51bWJlcjtcbiAgICBjb2xvcjogc3RyaW5nO1xuICB9W107XG59O1xuXG5leHBvcnQgaW50ZXJmYWNlIERvdFR5cGVzIHtcbiAgW2tleTogc3RyaW5nXTogRG90VHlwZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBHcmFkaWVudFR5cGVzIHtcbiAgW2tleTogc3RyaW5nXTogR3JhZGllbnRUeXBlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvcm5lckRvdFR5cGVzIHtcbiAgW2tleTogc3RyaW5nXTogQ29ybmVyRG90VHlwZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb3JuZXJTcXVhcmVUeXBlcyB7XG4gIFtrZXk6IHN0cmluZ106IENvcm5lclNxdWFyZVR5cGU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJhd1R5cGVzIHtcbiAgW2tleTogc3RyaW5nXTogRHJhd1R5cGU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2hhcGVUeXBlcyB7XG4gIFtrZXk6IHN0cmluZ106IFNoYXBlVHlwZTtcbn1cblxuZXhwb3J0IHR5cGUgVHlwZU51bWJlciA9XG4gIHwgMFxuICB8IDFcbiAgfCAyXG4gIHwgM1xuICB8IDRcbiAgfCA1XG4gIHwgNlxuICB8IDdcbiAgfCA4XG4gIHwgOVxuICB8IDEwXG4gIHwgMTFcbiAgfCAxMlxuICB8IDEzXG4gIHwgMTRcbiAgfCAxNVxuICB8IDE2XG4gIHwgMTdcbiAgfCAxOFxuICB8IDE5XG4gIHwgMjBcbiAgfCAyMVxuICB8IDIyXG4gIHwgMjNcbiAgfCAyNFxuICB8IDI1XG4gIHwgMjZcbiAgfCAyN1xuICB8IDI4XG4gIHwgMjlcbiAgfCAzMFxuICB8IDMxXG4gIHwgMzJcbiAgfCAzM1xuICB8IDM0XG4gIHwgMzVcbiAgfCAzNlxuICB8IDM3XG4gIHwgMzhcbiAgfCAzOVxuICB8IDQwO1xuXG5leHBvcnQgdHlwZSBFcnJvckNvcnJlY3Rpb25MZXZlbCA9IFwiTFwiIHwgXCJNXCIgfCBcIlFcIiB8IFwiSFwiO1xuZXhwb3J0IHR5cGUgTW9kZSA9IFwiTnVtZXJpY1wiIHwgXCJBbHBoYW51bWVyaWNcIiB8IFwiQnl0ZVwiIHwgXCJLYW5qaVwiO1xuZXhwb3J0IGludGVyZmFjZSBRUkNvZGUge1xuICBhZGREYXRhKGRhdGE6IHN0cmluZywgbW9kZT86IE1vZGUpOiB2b2lkO1xuICBtYWtlKCk6IHZvaWQ7XG4gIGdldE1vZHVsZUNvdW50KCk6IG51bWJlcjtcbiAgaXNEYXJrKHJvdzogbnVtYmVyLCBjb2w6IG51bWJlcik6IGJvb2xlYW47XG4gIGNyZWF0ZUltZ1RhZyhjZWxsU2l6ZT86IG51bWJlciwgbWFyZ2luPzogbnVtYmVyKTogc3RyaW5nO1xuICBjcmVhdGVTdmdUYWcoY2VsbFNpemU/OiBudW1iZXIsIG1hcmdpbj86IG51bWJlcik6IHN0cmluZztcbiAgY3JlYXRlU3ZnVGFnKG9wdHM/OiB7IGNlbGxTaXplPzogbnVtYmVyOyBtYXJnaW4/OiBudW1iZXI7IHNjYWxhYmxlPzogYm9vbGVhbiB9KTogc3RyaW5nO1xuICBjcmVhdGVEYXRhVVJMKGNlbGxTaXplPzogbnVtYmVyLCBtYXJnaW4/OiBudW1iZXIpOiBzdHJpbmc7XG4gIGNyZWF0ZVRhYmxlVGFnKGNlbGxTaXplPzogbnVtYmVyLCBtYXJnaW4/OiBudW1iZXIpOiBzdHJpbmc7XG4gIGNyZWF0ZUFTQ0lJKGNlbGxTaXplPzogbnVtYmVyLCBtYXJnaW4/OiBudW1iZXIpOiBzdHJpbmc7XG4gIHJlbmRlclRvMmRDb250ZXh0KGNvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgY2VsbFNpemU/OiBudW1iZXIpOiB2b2lkO1xufVxuXG5leHBvcnQgdHlwZSBPcHRpb25zID0ge1xuICB0eXBlPzogRHJhd1R5cGU7XG4gIHNoYXBlPzogU2hhcGVUeXBlO1xuICB3aWR0aD86IG51bWJlcjtcbiAgaGVpZ2h0PzogbnVtYmVyO1xuICBtYXJnaW4/OiBudW1iZXI7XG4gIGRhdGE/OiBzdHJpbmc7XG4gIGltYWdlPzogc3RyaW5nO1xuICBxck9wdGlvbnM/OiB7XG4gICAgdHlwZU51bWJlcj86IFR5cGVOdW1iZXI7XG4gICAgbW9kZT86IE1vZGU7XG4gICAgZXJyb3JDb3JyZWN0aW9uTGV2ZWw/OiBFcnJvckNvcnJlY3Rpb25MZXZlbDtcbiAgfTtcbiAgaW1hZ2VPcHRpb25zPzoge1xuICAgIGhpZGVCYWNrZ3JvdW5kRG90cz86IGJvb2xlYW47XG4gICAgaW1hZ2VTaXplPzogbnVtYmVyO1xuICAgIGNyb3NzT3JpZ2luPzogc3RyaW5nO1xuICAgIG1hcmdpbj86IG51bWJlcjtcbiAgfTtcbiAgZG90c09wdGlvbnM/OiB7XG4gICAgdHlwZT86IERvdFR5cGU7XG4gICAgY29sb3I/OiBzdHJpbmc7XG4gICAgZ3JhZGllbnQ/OiBHcmFkaWVudDtcbiAgfTtcbiAgY29ybmVyc1NxdWFyZU9wdGlvbnM/OiB7XG4gICAgdHlwZT86IENvcm5lclNxdWFyZVR5cGU7XG4gICAgY29sb3I/OiBzdHJpbmc7XG4gICAgZ3JhZGllbnQ/OiBHcmFkaWVudDtcbiAgfTtcbiAgY29ybmVyc0RvdE9wdGlvbnM/OiB7XG4gICAgdHlwZT86IENvcm5lckRvdFR5cGU7XG4gICAgY29sb3I/OiBzdHJpbmc7XG4gICAgZ3JhZGllbnQ/OiBHcmFkaWVudDtcbiAgfTtcbiAgYmFja2dyb3VuZE9wdGlvbnM/OiB7XG4gICAgcm91bmQ/OiBudW1iZXI7XG4gICAgY29sb3I/OiBzdHJpbmc7XG4gICAgZ3JhZGllbnQ/OiBHcmFkaWVudDtcbiAgfTtcbn07XG5cbmV4cG9ydCB0eXBlIEZpbHRlckZ1bmN0aW9uID0gKGk6IG51bWJlciwgajogbnVtYmVyKSA9PiBib29sZWFuO1xuXG5leHBvcnQgdHlwZSBEb3dubG9hZE9wdGlvbnMgPSB7XG4gIG5hbWU/OiBzdHJpbmc7XG4gIGV4dGVuc2lvbj86IEZpbGVFeHRlbnNpb247XG59O1xuXG5leHBvcnQgdHlwZSBEcmF3QXJncyA9IHtcbiAgeDogbnVtYmVyO1xuICB5OiBudW1iZXI7XG4gIHNpemU6IG51bWJlcjtcbiAgcm90YXRpb24/OiBudW1iZXI7XG4gIGdldE5laWdoYm9yPzogR2V0TmVpZ2hib3I7XG59O1xuXG5leHBvcnQgdHlwZSBCYXNpY0ZpZ3VyZURyYXdBcmdzID0ge1xuICB4OiBudW1iZXI7XG4gIHk6IG51bWJlcjtcbiAgc2l6ZTogbnVtYmVyO1xuICByb3RhdGlvbj86IG51bWJlcjtcbn07XG5cbmV4cG9ydCB0eXBlIFJvdGF0ZUZpZ3VyZUFyZ3MgPSB7XG4gIHg6IG51bWJlcjtcbiAgeTogbnVtYmVyO1xuICBzaXplOiBudW1iZXI7XG4gIHJvdGF0aW9uPzogbnVtYmVyO1xuICBkcmF3OiAoKSA9PiB2b2lkO1xufTtcblxuZXhwb3J0IHR5cGUgR2V0TmVpZ2hib3IgPSAoeDogbnVtYmVyLCB5OiBudW1iZXIpID0+IGJvb2xlYW47XG5cbmV4cG9ydCB0eXBlIEV4dGVuc2lvbkZ1bmN0aW9uID0gKHN2ZzogU1ZHRWxlbWVudCwgb3B0aW9uczogT3B0aW9ucykgPT4gdm9pZDtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiAobW9kdWxlWydkZWZhdWx0J10pIDpcblx0XHQoKSA9PiAobW9kdWxlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgUVJDb2RlU3R5bGluZyBmcm9tIFwiLi9jb3JlL1FSQ29kZVN0eWxpbmdcIjtcbmltcG9ydCBkb3RUeXBlcyBmcm9tIFwiLi9jb25zdGFudHMvZG90VHlwZXNcIjtcbmltcG9ydCBjb3JuZXJEb3RUeXBlcyBmcm9tIFwiLi9jb25zdGFudHMvY29ybmVyRG90VHlwZXNcIjtcbmltcG9ydCBjb3JuZXJTcXVhcmVUeXBlcyBmcm9tIFwiLi9jb25zdGFudHMvY29ybmVyU3F1YXJlVHlwZXNcIjtcbmltcG9ydCBlcnJvckNvcnJlY3Rpb25MZXZlbHMgZnJvbSBcIi4vY29uc3RhbnRzL2Vycm9yQ29ycmVjdGlvbkxldmVsc1wiO1xuaW1wb3J0IGVycm9yQ29ycmVjdGlvblBlcmNlbnRzIGZyb20gXCIuL2NvbnN0YW50cy9lcnJvckNvcnJlY3Rpb25QZXJjZW50c1wiO1xuaW1wb3J0IG1vZGVzIGZyb20gXCIuL2NvbnN0YW50cy9tb2Rlc1wiO1xuaW1wb3J0IHFyVHlwZXMgZnJvbSBcIi4vY29uc3RhbnRzL3FyVHlwZXNcIjtcbmltcG9ydCBkcmF3VHlwZXMgZnJvbSBcIi4vY29uc3RhbnRzL2RyYXdUeXBlc1wiO1xuaW1wb3J0IHNoYXBlVHlwZXMgZnJvbSBcIi4vY29uc3RhbnRzL3NoYXBlVHlwZXNcIjtcbmltcG9ydCBncmFkaWVudFR5cGVzIGZyb20gXCIuL2NvbnN0YW50cy9ncmFkaWVudFR5cGVzXCI7XG5cbmV4cG9ydCAqIGZyb20gXCIuL3R5cGVzXCI7XG5cbmV4cG9ydCB7XG4gIGRvdFR5cGVzLFxuICBjb3JuZXJEb3RUeXBlcyxcbiAgY29ybmVyU3F1YXJlVHlwZXMsXG4gIGVycm9yQ29ycmVjdGlvbkxldmVscyxcbiAgZXJyb3JDb3JyZWN0aW9uUGVyY2VudHMsXG4gIG1vZGVzLFxuICBxclR5cGVzLFxuICBkcmF3VHlwZXMsXG4gIHNoYXBlVHlwZXMsXG4gIGdyYWRpZW50VHlwZXNcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFFSQ29kZVN0eWxpbmc7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=