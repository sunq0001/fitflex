 export default (function(window, Array, doc) { 
    class Box {
      constructor(container) {
        this.container = this.toDOMArr(container);
        this.isArray = Array.isArray;
      }
  
      isDOMArr(dom) {
        let _this = this;
        if (_this.isArray(dom)) {
          dom.every(item => {
            return _this.isElement(item);
          });
        } else return false;
      }
  
      isElement(el) {
        return !!el && el.nodeType === 1;
      }
  
      isStringArr(el) {
        let _this = this;
        if (!_this.isArray(el)) return false;
        return el.every(item => {
          return typeof item == "string";
        });
      }
  
      isChild(container, child) {
        return child.parentNode == container;
      }
  
      toDOMArr(dom, container) {
        let _this = this;
        let ArrayFrom = Array.from;
        let domAll = [];
        let getElementsByClassName = doc.getElementsByClassName.bind(doc);
        let querySelectorAll = doc.querySelectorAll.bind(doc);
        if (_this.isElement(dom)) {
          domAll = [dom];
        } else if (dom instanceof NodeList || dom instanceof HTMLCollection) {
          domAll = ArrayFrom(dom);
        } else if (typeof dom == "string") {
          if (/^\./.test(dom)) {
            domAll = ArrayFrom(getElementsByClassName(dom.substring(1)));
          } else domAll = ArrayFrom(querySelectorAll(dom));
        } else if (_this.isStringArr(dom)) {
          for (let v of dom) {
            if (/^\./.test(v)) {
              domAll = domAll.concat(
                ArrayFrom(getElementsByClassName(v.substring(1)))
              );
            } else {
              domAll = domAll.concat(ArrayFrom(querySelectorAll(v)));
            }
          }
        } else if (_this.isArray(dom) && !_this.isStringArr(dom)) {
          for (let v of dom) {
            domAll = domAll.concat(_this.toDOMArr(v, container));
          }
        } else if (typeof dom == "object" || dom.d) {
          domAll = _this.toDOMArr(dom.d, container);
          let conWidth = _this.getStyle(container, "width");
          let conHeight = _this.getStyle(container, "height");
          let preW, preH;
          domAll.forEach(v => {
            let vStyle = v.style;
            if (dom.w) {    
              let width =
                conWidth * dom.w -
                _this.getStyle(v, "paddingLeft") -
                _this.getStyle(v, "paddingRight") -
                _this.getStyle(v, "borderLeft") -
                _this.getStyle(v, "borderLeft");
              vStyle.setProperty("width", width +'px');
  
              preW = width;
            } else if (preW) {
              vStyle.setProperty("width", preW + 'px');
            } else throw Error("pls help set property w in object");
            if (dom.h) {
              let height =
                conHeight * dom.h -
                _this.getStyle(v, "paddingTop") -
                _this.getStyle(v, "paddingBottom") -
                _this.getStyle(v, "borderTop") -
                _this.getStyle(v, "borderBottom");
              vStyle.setProperty("height", height + 'px');
              preH = height;
            } else if (preH) {
              vStyle.setProperty("height", preH + 'px');
            } else throw Error("pls help set property h in object");
          });
        } else throw Error("Incorrect DOM type description");
        if (container) {
          return domAll.filter(v => {
            return _this.isChild(container, v);
          });
        } else return domAll;
      }
  
      is2DArr(arr) {
        let _this = this;
        if (!_this.isArray(arr)) return false;
        return arr.every(item => {
          return _this.isArray(item);
        });
      }
  
      isNodeListArr(arr) {
        let _this = this;
        if (!_this.isArray(arr)) return false;
        return arr.every(item => {
          return item instanceof NodeList || item instanceof HTMLCollection;
        });
      }
  
      isArrPropdArr(arr) {
        let _this = this;
        if (!_this.isArray(arr)) return false;
        return arr.every(item => {
          return typeof item == "object" && item.d && _this.isArray(item.d);
        });
      }
  
      isArrPropdNodeList(arr) {
        let _this = this;
        if (!_this.isArray(arr)) return false;
        return arr.every(item => {
          return (
            typeof item == "object" &&
            item.d &&
            (item.d instanceof NodeList || item.d instanceof HTMLCollection)
          );
        });
      }
  
      adjustDOMchildren(dom, container) {
        let _this = this;
        let targetDOM = [];
        if (_this.is2DArr(dom) || _this.isNodeListArr(dom)) {
          dom.forEach(v => {
            targetDOM.push(_this.toDOMArr(v, container));
          });
        } else if (_this.isArrPropdArr(dom) || _this.isArrPropdNodeList(dom)) {
          dom.forEach(v => {
            targetDOM.push(_this.toDOMArr(v, container));
          });
        } else {
          targetDOM = _this.toDOMArr(dom, container);
        }
        return targetDOM;
      }
  
      getStyle(div, prop) {
        let getComputedStyle = window.getComputedStyle;
        let styleResult;
        if (/outerWidth|outerHeight/.test(prop)) {
          let outer = {
            outerWidth: { start: "Left", end: "Right", wh: "width" },
            outerHeight: { start: "Top", end: "Bottom", wh: "height" }
          };
          styleResult =
            parseInt(getComputedStyle(div)[outer[prop].wh]) +
            parseInt(getComputedStyle(div)["padding" + outer[prop].start]) +
            parseInt(getComputedStyle(div)["padding" + outer[prop].end]) +
            parseInt(getComputedStyle(div)["border" + outer[prop].start]) +
            parseInt(getComputedStyle(div)["border" + outer[prop].end]);
          return styleResult;
        }
        styleResult = getComputedStyle(div)[prop];
        if (/padding|border|margin|width|height/.test(prop))
          styleResult = parseInt(styleResult);
        return styleResult;
      }
  
      executeFlexByScreenWidth(option, initValue) {
        let _this = this;
        let screenMinWidth = option.screenWidth
          ? option.screenWidth.min ? option.screenWidth.min : 0
          : 0;
        let screenMaxWidth = option.screenWidth
          ? option.screenWidth.max ? option.screenWidth.max : Infinity
          : Infinity;
        let params = this.executeFlex(option, initValue);
        let screenWidth = window.screen.width;
        if (screenWidth <= screenMaxWidth && screenWidth >= screenMinWidth) {
          _this.renderDOM(params);
        }
  
        if (option.flexWhenResize) {
          window.addEventListener("resize", function() {
            let screenWidth = window.screen.width;
            if (screenWidth <= screenMaxWidth && screenWidth >= screenMinWidth) {
              if (params) _this.renderDOM(params);
            }
          });
        }
      }
  
      initPara(opts, container) {
        let _this = this;
        let children = opts.children || container.children;
        let targetArrDOM = _this.adjustDOMchildren(children, container);
        let targetArr2DMatrix = getArrMatrix(targetArrDOM);
        targetArrDOM = [].concat.apply([], targetArrDOM);
  
        function getArrMatrix(arr) {
          if (!_this.isArray(arr[0])) return arr.length;
          let arrMatrix = [];
          for (let v of arr) arrMatrix.push(v.length);
          return arrMatrix;
        }
  
        let screenWidth = screen.width;
        let screenHeight = screen.height;
        let containerWidth = _this.getStyle(container, "width");
        let containerHeight = _this.getStyle(container, "height");
  
        //�趨css��position����
        let targetPosition =
          opts.position && opts.position.children
            ? opts.position.children
            : "absolute";
        let containerPosition =
          opts.position && opts.position.container
            ? opts.position.container
            : "absolute";
  
        container.style.setProperty("position", containerPosition);
        for (let v of targetArrDOM)
          v.style.setProperty("position", targetPosition);
  
        //����������DOM��ֻ��¼outerWidth �� outerHeight����������
        let targetArrRatio = new Array(targetArrDOM.length);
        for (let i = 0; i < targetArrDOM.length; i++) {
          let width = _this.getStyle(targetArrDOM[i], "outerWidth");
          let height = _this.getStyle(targetArrDOM[i], "outerHeight");
          targetArrRatio[i] = {
            outerWidthRatio: width / screenWidth,
            outerHeightRatio: height / screenHeight
          };
        }
  
        return {
          containerWidthRatio: containerWidth / screenWidth,
          containerHeightRatio: containerHeight / screenHeight,
          targetArrRatio: targetArrRatio,
          container: container,
          targetArrDOM: targetArrDOM,
          targetArr2DMatrix: targetArr2DMatrix
        };
      }
  
      executeFlex(opts, initValue) {
        let _this = this;
        let containerWidthRatio = initValue.containerWidthRatio;
        let containerHeightRatio = initValue.containerHeightRatio;
        let targetArrDOM = initValue.targetArrDOM;
        let container = initValue.container;
        let targetArr2DMatrix = initValue.targetArr2DMatrix;
        let targetArr = JSON.parse(JSON.stringify(initValue.targetArrRatio));
        let gapRatio = {};
        if (opts.gapRatio) gapRatio = JSON.parse(JSON.stringify(opts.gapRatio));
        let location = opts.location;
        let center = opts.center;
        let adjust = opts.adjust;
  
        let gapLeft =
          gapRatio && gapRatio.outerAll
            ? gapRatio.outerAll * containerWidthRatio
            : gapRatio && gapRatio.left ? gapRatio.left * containerWidthRatio : 0;
  
        let gapRight =
          gapRatio && gapRatio.outerAll
            ? gapRatio.outerAll * containerWidthRatio
            : gapRatio && gapRatio.right
              ? gapRatio.right * containerWidthRatio
              : 0;
  
        let gapTop =
          gapRatio && gapRatio.outerAll
            ? gapRatio.outerAll * containerHeightRatio
            : gapRatio && gapRatio.top ? gapRatio.top * containerHeightRatio : 0;
  
        let gapBottom =
          gapRatio && gapRatio.outerAll
            ? gapRatio.outerAll * containerHeightRatio
            : gapRatio && gapRatio.bottom
              ? gapRatio.bottom * containerHeightRatio
              : 0;
  
        let gapWidthFit, gapHeightFit;
        if (gapRatio && /fit/i.test(gapRatio.innerWidth)) {
          gapRatio.innerWidth = 0;
          gapWidthFit = true;
        }
        if (gapRatio && /fit/i.test(gapRatio.innerHeight)) {
          gapRatio.innerHeight = 0;
          gapHeightFit = true;
        }
  
        let gapInnerWidthRatio =
          gapRatio && gapRatio.innerWidth ? gapRatio.innerWidth : 0;
        let gapInnerHeightRatio =
          gapRatio && gapRatio.innerHeight ? gapRatio.innerHeight : 0;
  
        let gapInnerWidth;
        if (!_this.isArray(gapInnerWidthRatio))
          gapInnerWidth = [gapInnerWidthRatio * containerWidthRatio];
        else gapInnerWidth = gapInnerWidthRatio.map(v => v * containerWidthRatio);
  
        let gapInnerHeight;
        if (!_this.isArray(gapInnerHeightRatio))
          gapInnerHeight = [gapInnerHeightRatio * containerHeightRatio];
        else
          gapInnerHeight = gapInnerHeightRatio.map(v => v * containerHeightRatio);
  
        let conInnerWidth = containerWidthRatio - gapLeft - gapRight;
        let conInnerHeight = containerHeightRatio - gapTop - gapBottom;
  
        let conInner = { width: conInnerWidth, height: conInnerHeight };
        let gapInner = { width: gapInnerWidth, height: gapInnerHeight };
  
        //f����F����˼��forward, c����C����˼��cross�� Dimen��dimension����д
        //forward����˼�ǳ������еķ���cross����˼�����еĴ�ֱ����ķ���
        //������Ϊ�˶�����������horizontal, vertical���������У��ϲ�����
        let gapFSta,
          gapFEnd,
          gapCSta,
          gapCEnd,
          gapFFit,
          gapCFit,
          containerCDimen,
          containerFDimen;
        if (/vertical/i.test(location)) {
          targetArr = targetArr.map(v => {
            v.forwardDimen = v.outerHeightRatio;
            v.crossDimen = v.outerWidthRatio;
            delete v.outerHeight;
            delete v.outerWidth;
            return v;
          });
          containerFDimen = containerHeightRatio;
          containerCDimen = containerWidthRatio;
          conInner.fDimen = conInner.height;
          conInner.cDimen = conInner.width;
          gapInner.fDimen = gapInner.height;
          gapInner.cDimen = gapInner.width;
          gapFSta = gapTop;
          gapFEnd = gapBottom;
          gapCSta = gapLeft;
          gapCEnd = gapRight;
          gapFFit = gapHeightFit;
          gapCFit = gapWidthFit;
        } else {
          targetArr = targetArr.map(function(v) {
            v.forwardDimen = v.outerWidthRatio;
            v.crossDimen = v.outerHeightRatio;
            delete v.outerWidth;
            delete v.outerHeight;
            return v;
          });
          containerFDimen = containerWidthRatio;
          containerCDimen = containerHeightRatio;
          conInner.fDimen = conInner.width;
          conInner.cDimen = conInner.height;
          gapInner.fDimen = gapInner.width;
          gapInner.cDimen = gapInner.height;
          gapFSta = gapLeft;
          gapFEnd = gapRight;
          gapCSta = gapTop;
          gapCEnd = gapBottom;
          gapFFit = gapWidthFit;
          gapCFit = gapHeightFit;
        }
  
        function getTargetArr2DMatrix(targetArr, conInner, gapInner) {
          let arr2DMatrix = [];
          let conInnerLength, gapInnerLength;
          let colLength = 0;
          let targetLengthArr = targetArr.slice(0).map(v => v.forwardDimen);
          conInnerLength = conInner.fDimen;
          gapInnerLength = gapInner.fDimen;
          let gCount = 0;
          for (let i = 0; i < targetLengthArr.length; i++) {
            if (!gapInnerLength[gCount])
              gapInnerLength.push(gapInnerLength[gapInnerLength.length - 1]);
            colLength +=
              i == 0
                ? targetLengthArr[i]
                : gapInnerLength[gCount] + targetLengthArr[i];
            if (colLength > conInnerLength) {
              if (i == 0) {
                let msg = `Container inner space's width and height 
                              must be longer than children outer space's`;
                alert(msg);
                throw Error(msg);
              }
              arr2DMatrix.push(i);
              targetLengthArr.splice(0, i);
              gCount++;
              colLength = 0;
              i = -1; //ֻ����-1���¸�ѭ������Ż��� i == 0;
            }
          }
          if (targetLengthArr.length > 0)
            arr2DMatrix.push(targetLengthArr.length);
          return arr2DMatrix;
        }
  
        function arrFrom1DTo2D(targetArr, targetArr2DMatrix) {
          let rowLen = _this.isArray(targetArr2DMatrix)
            ? targetArr2DMatrix.length
            : Math.ceil(targetArr.length / targetArr2DMatrix);
          let count = 0;
          let arr2D = new Array(rowLen);
          for (let row = 0; row < arr2D.length; row++) {
            arr2D[row] = _this.isArray(targetArr2DMatrix)
              ? new Array(targetArr2DMatrix[row])
              : new Array(targetArr2DMatrix);
            for (let col = 0; col < arr2D[row].length; col++) {
              arr2D[row][col] = targetArr[count];
              count++;
            }
          }
          return arr2D;
        }
  
        if (adjust && /oneline/i.test(adjust)) {
          let onelineArrLength;
          if (_this.isArray(targetArr2DMatrix)) {
            onelineArrLength = targetArr2DMatrix.reduce((pre, cur) => {
              return pre + cur;
            });
          } else onelineArrLength = targetArr.length;
          targetArr2DMatrix = [onelineArrLength];
        } else {
          if (!_this.isArray(targetArr2DMatrix)) {
            targetArr2DMatrix = getTargetArr2DMatrix(
              targetArr,
              conInner,
              gapInner
            );
          }
        }
  
        let targetArr2D = arrFrom1DTo2D(targetArr, targetArr2DMatrix);
        function createEmptyArr2D(arr2DMatrix) {
          if (!_this.isArray(arr2DMatrix)) return new Array(arr2DMatrix);
          let newArr = [];
          for (let row = 0; row < arr2DMatrix.length; row++) {
            let arr2 = new Array(arr2DMatrix[row]);
            newArr.push(arr2);
          }
          return newArr;
        }
  
        //��ֱ����ʱ��ÿһ�п�����
        //ˮƽ����ʱ��ÿһ�и߶����
        for (let f = 0; f < targetArr2D.length; f++) {
          for (let c = 0; c < targetArr2D[f].length; c++) {
            targetArr2D[f][c].crossDimen = targetArr2D[f][0].crossDimen;
          }
        }
  
        if (gapFFit) {
          for (let f = 0; f < targetArr2D.length; f++) {
            let accumFDimen = accumArrSum(targetArr2D[f], "forward");
            gapInner.fDimen[f] =
              (conInner.fDimen - accumFDimen) / (targetArr2D[f].length - 1);
          }
        } else {
          for (let f = 0; f < targetArr2D.length; f++) {
            if (!gapInner.fDimen[f])
              gapInner.fDimen[f] = gapInner.fDimen[gapInner.fDimen.length - 1];
          }
        }
  
        if (gapCFit) {
          for (let f = 0; f < targetArr2D.length - 1; f++) {
            let tempArr = getCrossArrInArr2D(targetArr2D, 0);
            let accumCDimen = accumArrSum(tempArr, "cross");
            gapInner.cDimen[f] =
              (conInner.cDimen - accumCDimen) / (targetArr2D.length - 1);
          }
        } else {
          for (let f = 0; f < targetArr2D.length - 1; f++) {
            if (!gapInner.cDimen[f])
              gapInner.cDimen[f] = gapInner.cDimen[gapInner.cDimen.length - 1];
          }
        }
  
        gapInner.fDimen = gapInner.fDimen.slice(0, targetArr2D.length);
        gapInner.cDimen = gapInner.cDimen.slice(0, targetArr.length - 1);
  
        function accumArrSum(arr, arrIndex, box) {
          let sum = 0;
          if (!arr || !arr[0]) return sum;
  
          if (arrIndex == undefined) arrIndex = arr.length - 1;
          if (arrIndex == "forward" || arrIndex == "cross") {
            box = arrIndex;
            arrIndex = arr.length - 1;
          }
          for (let i = 0; i < arrIndex + 1; i++) {
            if (box == "forward") {
              sum += arr[i].forwardDimen;
            } else if (box == "cross") {
              sum += arr[i].crossDimen;
            } else {
              sum += arr[i];
            }
          }
          return sum;
        }
  
        let offsetCArr = [],
          offsetFArr = [];
        if (!adjust) {
          [offsetFArr, offsetCArr] = getOffsetArr(
            targetArr2D,
            gapInner,
            conInner,
            center
          );
        } else {
          for (let f = 0; f < targetArr2D.length; f++) {
            offsetFArr.push(0);
            offsetCArr.push(0);
          }
        }
  
        function getOffsetArr(targetArr2D, gapInner, conInner, center) {
          let isArr1D;
          if (!_this.isArray(targetArr2D[0])) {
            targetArr2D = [targetArr2D];
            isArr1D = true;
          }
  
          let offsetCArr = [];
          let offsetFArr = [];
  
          for (let f = 0; f < targetArr2D.length; f++) {
            let offsetFDimen;
            if (/forward|bothway/i.test(center)) {
              let accumFDimen = accumArrSum(targetArr2D[f], "forward");
              let accumGapFDimen =
                gapInner.fDimen[f] * (targetArr2D[f].length - 1);
              offsetFDimen = (conInner.fDimen - accumFDimen - accumGapFDimen) / 2;
            } else offsetFDimen = 0;
            offsetFArr.push(offsetFDimen);
          }
  
          let offsetCDimen;
          if (/cross|bothway/i.test(center)) {
            let tempArr = getCrossArrInArr2D(targetArr2D, 0);
            let accumCDimen = accumArrSum(tempArr, "cross");
            let accumGapCDimen = gapInner.cDimen.reduce((pre, cur) => {
              return pre + cur;
            }, 0);
            offsetCDimen = (conInner.cDimen - accumCDimen - accumGapCDimen) / 2;
          } else offsetCDimen = 0;
  
          for (let f = 0; f < targetArr2D.length; f++) {
            offsetCArr.push(offsetCDimen);
          }
  
          if (isArr1D) [targetArr2D] = targetArr2D;
          return [offsetFArr, offsetCArr];
        }
  
        function getCrossArrInArr2D(arr, crossIndex) {
          let tempArr = [];
          for (let i = 0; i < arr.length; i++) {
            tempArr.push(arr[i][crossIndex]);
          }
          return tempArr;
        }
  
        let fDimenPosArr = createEmptyArr2D(targetArr2DMatrix);
        let cDimenPosArr = createEmptyArr2D(targetArr2DMatrix);
  
        for (let f = 0; f < targetArr2D.length; f++) {
          for (let c = 0; c < targetArr2D[f].length; c++) {
            let fDimenPos, cDimenPos;
            if (c == 0) fDimenPos = gapFSta + offsetFArr[f];
            else {
              let accumFDimen = accumArrSum(targetArr2D[f], c - 1, "forward");
              let accumGapFDimen = gapInner.fDimen[f] * c;
              fDimenPos = gapFSta + accumGapFDimen + offsetFArr[f] + accumFDimen;
            }
            if (f == 0) cDimenPos = gapCSta + offsetCArr[f];
            else {
              let tempArr = getCrossArrInArr2D(targetArr2D, 0);
              let accumCDimen = accumArrSum(tempArr, f - 1, "cross");
              let accumGapCDimen = accumArrSum(gapInner.cDimen, f - 1);
              cDimenPos = gapCSta + accumGapCDimen + offsetCArr[f] + accumCDimen;
            }
            fDimenPosArr[f][c] = fDimenPos;
            cDimenPosArr[f][c] = cDimenPos;
          }
        }
  
        //��������ã���������߽��е���
        if (adjust && /multiline/i.test(adjust)) {
          if (/OuterFit/i.test(adjust)) {
            if (/Forward|Bothway/i.test(adjust)) {
              let tempArrFDimen = [];
              for (let f = 0; f < fDimenPosArr.length; f++) {
                tempArrFDimen.push(
                  fDimenPosArr[f][fDimenPosArr[f].length - 1] +
                    targetArr2D[f][targetArr2D[f].length - 1].forwardDimen
                );
              }
              let maxFDimen = Math.max.apply(null, tempArrFDimen);
              containerFDimen = maxFDimen + gapFEnd;
            }
  
            if (/Cross|Bothway/i.test(adjust)) {
              let tempArrCDimen = [];
              for (
                let c = 0;
                c < cDimenPosArr[cDimenPosArr.length - 1].length;
                c++
              ) {
                tempArrCDimen.push(
                  cDimenPosArr[cDimenPosArr.length - 1][c] +
                    targetArr2D[targetArr2D.length - 1][c].crossDimen
                );
              }
              let maxCDimen = Math.max.apply(null, tempArrCDimen);
              containerCDimen = maxCDimen + gapCEnd;
            }
          }
  
          if (/InnerFit/i.test(adjust)) {
            if (/Forward|Bothway/i.test(adjust)) {
              for (let f = 0; f < targetArr2D.length; f++) {
                adjustOnelineInnerFit(
                  fDimenPosArr[f],
                  targetArr2D[f],
                  containerFDimen,
                  gapFEnd,
                  "forward"
                );
              }
            }
  
            if (/Cross|Bothway/i.test(adjust)) {
              let tempAdjustTargetArr = getCrossArrInArr2D(targetArr2D, 0);
              let tempAdjustCDimenPosArr = getCrossArrInArr2D(cDimenPosArr, 0);
              adjustOnelineInnerFit(
                tempAdjustCDimenPosArr,
                tempAdjustTargetArr,
                containerCDimen,
                gapCEnd,
                "cross"
              );
              for (let f = 0; f < targetArr2D.length; f++) {
                for (let c = 0; c < targetArr2D[f].length; c++) {
                  targetArr2D[f][c].crossDimen =
                    tempAdjustTargetArr[f].crossDimen;
                  cDimenPosArr[f][c] = tempAdjustCDimenPosArr[f];
                }
              }
            }
          }
  
          conInner = {
            cDimen: containerCDimen - gapCSta - gapCEnd,
            fDimen: containerFDimen - gapFSta - gapFEnd
          };
          let [adjustOffsetFArr, adjustOffsetCArr] = getOffsetArr(
            targetArr2D,
            gapInner,
            conInner,
            center
          );
  
          for (let i = 0; i < targetArr2D.length; i++) {
            for (let j = 0; j < targetArr2D[i].length; j++) {
              cDimenPosArr[i][j] += adjustOffsetCArr[i];
              fDimenPosArr[i][j] += adjustOffsetFArr[i];
            }
          }
        }
  
        function flattenArr(arr) {
          let arrTemp = [];
          (function loop(arr, arrT) {
            for (let i = 0; i < arr.length; i++) {
              if (!_this.isArray(arr[i])) arrT.push(arr[i]);
              else {
                loop(arr[i], arrT);
              }
            }
          })(arr, arrTemp);
          return arrTemp;
        }
  
        //����ά����Ĩƽ��һά����
        let cDimenPosArr2DTo1D = flattenArr(cDimenPosArr);
        let fDimenPosArr2DTo1D = flattenArr(fDimenPosArr);
        let targetArr2DTo1D = flattenArr(targetArr2D);
  
        //��������ã���������߽��е���
        if (adjust && /oneline/i.test(adjust)) {
          if (/InnerFit/i.test(adjust)) {
            if (/Forward|Bothway/i.test(adjust)) {
              adjustOnelineInnerFit(
                fDimenPosArr2DTo1D,
                targetArr2DTo1D,
                containerFDimen,
                gapFEnd,
                "forward"
              );
            }
            if (/Cross|Bothway/i.test(adjust)) {
              targetArr2DTo1D = targetArr2DTo1D.map(v => {
                v.crossDimen = containerCDimen - gapCSta - gapCEnd;
                return v;
              });
            }
          }
  
          if (/OuterFit/i.test(adjust)) {
            if (/Forward|Bothway/i.test(adjust)) {
              containerFDimen =
                fDimenPosArr2DTo1D[fDimenPosArr2DTo1D.length - 1] +
                targetArr2DTo1D[targetArr2DTo1D.length - 1].forwardDimen +
                gapFEnd;
            }
  
            if (/Cross|Bothway/i.test(adjust)) {
              let targetArr2CDimenArr = targetArr2DTo1D.map(v => v.crossDimen);
              let maxCDimen = Math.max.apply(null, targetArr2CDimenArr);
              containerCDimen = gapCSta + gapCEnd + maxCDimen;
            }
          }
  
          conInner = {
            cDimen: containerCDimen - gapCSta - gapCEnd,
            fDimen: containerFDimen - gapFSta - gapFEnd
          };
  
          let [adjustOffsetFArr, adjustOffsetCArr] = getOffsetArr(
            targetArr2DTo1D,
            gapInner,
            conInner,
            center
          );
          for (let i = 0; i < targetArr2DTo1D.length; i++) {
            cDimenPosArr[i] += adjustOffsetCArr[0];
            fDimenPosArr[i] += adjustOffsetFArr[0];
          }
        }
  
        function adjustOnelineInnerFit(
          posArr,
          targetArr,
          containerLength,
          gap,
          forwardOrCross
        ) {
          let prop;
          if (forwardOrCross == "forward") prop = "forwardDimen";
          else if (forwardOrCross == "cross") prop = "crossDimen";
          let maxLength =
            posArr[posArr.length - 1] +
            targetArr[targetArr.length - 1][prop] +
            gap;
          let deltaLength = containerLength - maxLength;
          let targetTotalLength = accumArrSum(targetArr, forwardOrCross);
          let targetArrLengthWeightArr = targetArr.map(
            v => v[prop] / targetTotalLength
          );
          let preDeltaLengthSum = 0;
          for (let i = 0; i < targetArr.length; i++) {
            posArr[i] += preDeltaLengthSum;
            let deltaLengthSingle = deltaLength * targetArrLengthWeightArr[i];
            preDeltaLengthSum += deltaLengthSingle;
            targetArr[i][prop] += deltaLengthSingle;
          }
        }
  
        targetArr2DTo1D = targetArr2DTo1D.map(v => {
          [v.outerHeightRatio, v.outerWidthRatio] = [
            v.crossDimen,
            v.forwardDimen
          ];
          if (/vertical/i.test(location))
            [v.outerHeightRatio, v.outerWidthRatio] = [
              v.forwardDimen,
              v.crossDimen
            ];
          return v;
        });
  
        [containerWidthRatio, containerHeightRatio] = [
          containerFDimen,
          containerCDimen
        ];
        if (/vertical/i.test(location))
          [containerWidthRatio, containerHeightRatio] = [
            containerCDimen,
            containerFDimen
          ];
  
        let leftPosArrRatio = fDimenPosArr2DTo1D,
          topPosArrRatio = cDimenPosArr2DTo1D;
        if (/vertical/i.test(location))
          [topPosArrRatio, leftPosArrRatio] = [leftPosArrRatio, topPosArrRatio];
  
        return {
          containerWidthRatio: containerWidthRatio,
          containerHeightRatio: containerHeightRatio,
          leftPosArrRatio: leftPosArrRatio,
          topPosArrRatio: topPosArrRatio,
          targetArr2DTo1DRatio: targetArr2DTo1D,
          container: container,
          targetArrDOM: targetArrDOM
        };
      }
  
      renderDOM(args) {
        let _this = this;
        let windowWidth = window.screen.width;
        let windowHeight = window.screen.height;
        let container = args.container;
        let targetArrDOM = args.targetArrDOM;
        let containerWidth = args.containerWidthRatio * windowWidth;
        let containerHeight = args.containerHeightRatio * windowHeight;
        let leftPosArr = args.leftPosArrRatio.map(v => v * windowWidth);
        let topPosArr = args.topPosArrRatio.map(v => v * windowHeight);
        let targetArr2DTo1D = args.targetArr2DTo1DRatio.map(v => {
          v.outerWidth = v.outerWidthRatio * windowWidth;
          v.outerHeight = v.outerHeightRatio * windowHeight;
          return v;
        });
  
        let conStyle = container.style;
        conStyle.setProperty("width", containerWidth + "px");
        conStyle.setProperty("height", containerHeight + "px");
  
        let cssArr = [
          { start: "Left", end: "Right", prop: "width", outerProp: "outerWidth" },
          {
            start: "Top",
            end: "Bottom",
            prop: "height",
            outerProp: "outerHeight"
          }
        ];
        for (let i = 0; i < targetArrDOM.length; i++) {
          let itemStyle = targetArrDOM[i].style;
          for (let v of cssArr) {
            let delta =
              _this.getStyle(targetArrDOM[i], "padding" + v.start) +
              _this.getStyle(targetArrDOM[i], "padding" + v.end) +
              _this.getStyle(targetArrDOM[i], "border" + v.start) +
              _this.getStyle(targetArrDOM[i], "border" + v.end);
            let dimension = targetArr2DTo1D[i][v.outerProp] - delta;
            itemStyle.setProperty(v.prop, dimension + "px");
          }
          itemStyle.setProperty("left", leftPosArr[i] + "px");
          itemStyle.setProperty("top", topPosArr[i] + "px");
        }
      }
  
      toOptsArr(optsArr) {
        let _this = this;
        let optsArray = [];
        if (!_this.isArray(optsArr)) optsArray.push(optsArr);
        else optsArray = optsArr;
        return optsArray;
      }
  
      init(optsArr) {
        this.initDone = true;
        let _this = this;
        this.container.forEach(container => {
          let initValueArr = _this.toOptsArr(optsArr).map(v => {
            return _this.initPara(v, container);
          });
          container.initValueArr = initValueArr;
        });
        return this;
      }
  
      flex(optsArr) {
        if (!this.initDone) this.init(optsArr);
        let _this = this;
        this.container.forEach(container => {
          let optsArray = _this.toOptsArr(optsArr);
          for (let i = 0; i < container.initValueArr.length; i++) {
            if (optsArray[i]) {
              _this.executeFlexByScreenWidth(
                optsArray[i],
                container.initValueArr[i]
              );
            }
          }
        });
        return this;
      }
    }

    return function(container) {
      return new Box(container);
    };
  
 
  })(window, Array, document);




