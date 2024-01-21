  export function getCenter(ref){
    const rect = ref.getBoundingClientRect();
    const center = {
      x : rect.x + (rect.width/2),
      y : rect.y + (rect.height/2)
    }
    return [center.x, center.y]
  }
  export function getBox(ref){
      const [centerX, centerY] = getCenter(ref)
      const [a, b, c, d, e, f] = getTransform(ref)
      const [oldCenterX, oldCenterY] = findOldOrigin(e,f,centerX, centerY)
      const [top, left, width, height] = getBoxOld(ref)
      const [x, y] = applyMatrixTransform(a, b, c, d, e, f, left, top, oldCenterX, oldCenterY)
      return [x, y]
  }
  // maybe getBox can be simplified
  // does this even work for aggregates ^^
  export function applyMatrixTransform(a, b, c, d, e, f, x, y, w, z){
    const x1 = x - w;
    const y1 = y - z;
    
    const x2 = a * x1 + c * y1 + e + w;
    const y2 = b * x1 + d * y1 + f + z;


    return [x2, y2];
  }
  export function applyMatrixTransformBasic(a, b, c, d, x, y){
    const x1 = a * x + c * y;
    const y1 = b * x + d * y;
    return [x1, y1];
  }
  export function calculateModulus(x, y){
    return Math.sqrt(x * x + y * y);
  }
  export function calculateSquare(x, y){
    return x * x + y * y;
  }
  export function dotProduct(x, y, w, z){
    return x * w + y * z;
  }
  export function normaliseVector(x, y){
    const modulus = calculateModulus(x, y)
    return [x/modulus, y/modulus]
  }
  export function absoluteValue(x){
    if( x < 0) return -x
    else return x
  }
  export function findOldOrigin(e, f, w, z){
    return [w - e, z - f]
  }
  export function calculateAngle(x1, y1, x2, y2) {
    const angleInRadians = Math.atan2(y2, x2) - Math.atan2(y1, x1);
    return angleInRadians;
  }
  export function findInverseMatrix(a, b, c, d){
    const determinant = a * d - b * c;
  
    if (determinant === 0) {
      return null;
    }
  
    const a1 = d / determinant
    const b1 = -b / determinant
    const c1 = -c / determinant
    const d1 = a / determinant

    return [a1, b1, c1, d1];
  }
  export function getTransform(ref){
    const matrixString = getComputedStyle(ref).transform
    const regex = /\(([^,]+),([^,]+),([^,]+),([^,]+),([^,]+),([^)]+)\)/;
    const matches = matrixString.match(regex);
  
    if (matches && matches.length === 7) {
      const [_, a, b, c, d, e, f] = matches;
      return [parseFloat(a), parseFloat(b), parseFloat(c), parseFloat(d), parseFloat(e), parseFloat(f)];
    } else {
      return [1,0,0,1,0,0];
    }
  }
  export function getBoxOld(ref){
    const [centerX, centerY] = getCenter(ref)
    const width = ref.offsetWidth
    const height = ref.offsetHeight
    const [a, b, c, d, e, f] = getTransform(ref)
    const left = centerX - width/2 - e
    const top = centerY - height/2 - f
    return [top, left, width, height]
  }
  export function getAngle(A){
    const angle = Math.atan2(A[1], A[0]);
    return angle
  }
  export function getAngleDeg(A){
    const angle = Math.atan2(A[1], A[0]);
    return angle* (180 / Math.PI)
  }
  export function getSinBAndCosB(a,b){
    const modulus = calculateModulus(a,b)
    const cosB = a/modulus
    const sinB = b/modulus
    return [sinB, cosB]
  }
  export function multiplyMatrices( a2, b2, c2, d2, a1, b1, c1, d1) {
    const a = a1 * a2 + b1 * c2
    const b = a1 * b2 + b1 * d2
    const c = c1 * a2 + d1 * c2
    const d = c1 * b2 + d1 * d2
  
    return [a, b, c, d];
  }
  export function getSkew(A){
    const [a,b,c,d,e,f] = A
    const skewX = calculateModulus(a,b)
    const skewY = calculateModulus(c,d)
    return [skewX, skewY]

  }
  export function createTransformationMatrix(B, x, y, skewX, skewY){
    const cosB = Math.cos(B);
    const sinB = Math.sin(B);
  
    const a = cosB;
    const b = sinB;
    const c = -sinB;
    const d = cosB;
    const e = x;
    const f = y;
    const matrix = `matrix(${skewX*a},${skewX*b},${skewY*c},${skewY*d},${e},${f})`

  
    return matrix;
  };
  export function createTransformationMatrixSkew(skewX, skewY){
    const a = 1/skewX
    const b = 0
    const c = 0
    const d = 1/skewY
    const matrix = `matrix(${a}, ${b}, ${c}, ${d}, 0, 0)`
    return matrix
  }
  export function getMatrixDestructured(matrixProp){
    const a = matrixProp[0]
    const b = matrixProp[1]
    const c = matrixProp[2]
    const d = matrixProp[3]
    const e = matrixProp[4]
    const f = matrixProp[5]
    return [ a,b,c,d,e,f]
  }
  export function calculateInverseMatrix(a,b,c,d,e,f){
    const [a1, b1, c1, d1] = findInverseMatrix(a,b,c,d)
    const e1 = -1*(a1*e + c1*f)
    const f1 = -1*(b1*e + d1*f)
    return [a1, b1, c1, d1, e1, f1]
  }
  export function calculateInverseMatrixArray(A){
    const [a, b, c, d, e, f] = [A[0],A[1],A[2],A[3],A[4],A[5]]
    
    const [a1, b1, c1, d1] = findInverseMatrix(a,b,c,d)
    const e1 = -1*(a1*e + c1*f)
    const f1 = -1*(b1*e + d1*f)
    return [a1, b1, c1, d1, e1, f1]
  }
  export function composeMatrix(a2,b2,c2,d2,e2,f2,a1,b1,c1,d1,e1,f1){
    const [a3, b3, c3, d3] = multiplyMatrices(a2,b2,c2,d2,a1,b1,c1,d1)
    const [x1, y1] = applyMatrixTransformBasic(a2,b2,c2,d2,e1,f1)
    const x2 = x1 + e2
    const y2 = y1 + f2
    return [a3, b3, c3, d3, x2, y2]
  }
  export function composeMatrixArray(aggregateMatrix,adjustingMatrix){
    const [a1, b1, c1, d1, e1, f1] = adjustingMatrix
    const [a2, b2, c2, d2, e2, f2] = aggregateMatrix


    const [a3, b3, c3, d3] = multiplyMatrices(a2,b2,c2,d2,a1,b1,c1,d1)
    const [x1, y1] = applyMatrixTransformBasic(a2,b2,c2,d2,e1,f1)
    const x2 = x1 + e2
    const y2 = y1 + f2
    const C = [a3, b3, c3, d3, x2, y2]
    return C
  }
  export function writeMatrix(A){
    const [a,b,c,d,e,f] = A
    const transformMatrix = `matrix(${a},${b},${c},${d},${e},${f})`
    return transformMatrix
  }
  export function composeMatrixArrayNew(aggregateMatrix,adjustingMatrix){
    const [a1, b1, c1, d1, e1, f1] = adjustingMatrix
    const [a2, b2, c2, d2, e2, f2] = aggregateMatrix
    const a = (a1*a2)-(b1*b2)
    const b = (b1*a2)+(a1*b2)
    const c = (c1*d2)+(d1*c2)
    const d = (d1*d2)-(c1*c2)

    const [x1, y1] = applyMatrixTransformBasic(a2,b2,c2,d2,e1,f1)
    const e = e2 + x1;
    const f = f2 + y1;
    const matrix = [a,b,c,d,e,f]

    return matrix
  }
  export function InverseComposeMatrixArrayNew(newAggregateMatrix, oldAggregateMatrix){
    const [a, b, c, d, e, f] = newAggregateMatrix
    const [a2, b2, c2, d2, e2, f2] = oldAggregateMatrix
    const x1 = e - e2;
    const y1 = f - f2;
    const [a3,b3,c3,d3] = findInverseMatrix(a2,b2,c2,d2)
    const [e1,f1] = applyMatrixTransformBasic(a3,b3,c3,d3,x1,y1)
    const a1 = (a*a2 + b*b2)/(a2*a2 + b2*b2)
    const b1 = (b*a2 - a*b2)/(a2*a2 - b2*b2)
    const c1 = (c*d2 - d*c2)/(d2*d2 - c2*c2)
    const d1 = (c*c2 + d*d2)/(c2*c2 + d2*d2)
    return [a1, b1, c1, d1, e1, f1]
  }
  export function InverseComposeMatrixArrayNew2(newAggregateMatrix, oldAggregateMatrix){
    const [a, b, c, d, e, f] = newAggregateMatrix
    const [a2, b2, c2, d2, e2, f2] = oldAggregateMatrix
    const [skewX1, skewY1] = getSkew(oldAggregateMatrix)
    const [skewX2, skewY2] = getSkew(newAggregateMatrix)
    const angleOld = getAngle(oldAggregateMatrix)
    const angleNew = getAngle(newAggregateMatrix)
    const angleDifference = angleNew - angleOld
    const newSkewX = skewX2/skewX1
    const newSkewY = skewY2/skewY1

    const x1 = e - e2;
    const y1 = f - f2;
    const [a3,b3,c3,d3] = findInverseMatrix(a2,b2,c2,d2)
    const [e1,f1] = applyMatrixTransformBasic(a3,b3,c3,d3,x1,y1)
    const cosB = Math.cos(angleDifference);
    const sinB = Math.sin(angleDifference);
    const a1 = newSkewX*cosB;
    const b1 = newSkewX*sinB;
    const c1 = -1*newSkewY*sinB;
    const d1 = newSkewY*cosB;
    return [a1, b1, c1, d1, e1, f1]
  }
  export function createTransformationMatrixSkewAndAngle(B, x, y, skewX, skewY){
    const C = B* ( Math.PI /180)
    const cosB = Math.cos(C);
    const sinB = Math.sin(C);
    const a = cosB;
    const b = sinB;
    const c = -sinB;
    const d = cosB;
    const e = x;
    const f = y;
    const matrix = [skewX*a,skewX*b,skewY*c,skewY*d,e,f]
  
    return matrix;
  };

  export function InverseComposeMatrixArray(newAggregateMatrix, oldAggregateMatrix){
    const [a1, b1, c1, d1, e1, f1] = oldAggregateMatrix
    const [a2, b2, c2, d2, e2, f2] = newAggregateMatrix
    const [a3,b3,c3,d3] = findInverseMatrix(a1,b1,c1,d1)
    const [a,b,c,d] = multiplyMatrices(a3,b3,c3,d3,a2,b2,c2,d2)
    const [e,f] = applyMatrixTransformBasic(a3,b3,c3,d3,(e2-e1),(f2-f1))
    return [a,b,c,d,e,f]
  }

  export function findAggregateMatrix(item, temp){
    let aggregateMatrix = [1,0,0,1,0,0]
    const layers = [item]
    let parent = item.parentNode
    while(parent.classList.contains('under-transform')){
      layers.push(parent)
      parent = parent.parentNode
    }
    layers.forEach((x,i) => {
      let layerTransform = getTransform(x)
      aggregateMatrix = composeMatrixArray(layerTransform, aggregateMatrix)
    })
    return aggregateMatrix
  }
  export function findAggregateMatrixParent(item){
    const parent = item.parentNode
    const aggregateMatrix = findAggregateMatrix(parent)
    return aggregateMatrix
  }


  export function findInverseAggregateMatrix(ref){
    const transform = findAggregateMatrix(ref)
    const inverseTransform = calculateInverseMatrixArray(transform)
    return inverseTransform
  }


  export function getBoundingClientRectLayer(ref){

  }


  export function getRGBA(hexColor){
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, 1)`;
  };
  export function getRGBAOpacity(hexColor, opacity){
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };
  export function handlePrintCanvas(childId, parentId){

    const child = document.querySelector(`[data-id="${childId}"].layer`)
    const newParent = document.querySelector(`[data-id="${parentId}"].layer`)
    const aggregateMatrixChild = findAggregateMatrix(child)
    const aggregateMatrixNewParent = findAggregateMatrix(newParent)
    const transformMatrix = InverseComposeMatrixArray(aggregateMatrixChild, aggregateMatrixNewParent)

    const canvas = newParent.querySelector('.layer-canvas');
    const context = canvas.getContext('2d');

    const canvasChild = child.querySelector('.layer-canvas')
    const canvasChildImage = canvasChild.toDataURL('image/png');

    const canvasChildWidth = canvasChild.clientWidth
    const canvasChildHeight = canvasChild.clientHeight

    const image = new Image();
    image.src = canvasChildImage

    image.onload = () => {

      const height = Number(getComputedStyle(canvas).height.slice(0,-2))
      const width = Number(getComputedStyle(canvas).width.slice(0,-2))
      const scaleFactorX = context.canvas.width/width
      const scaleFactorY = context.canvas.height/height

      const w = context.canvas.width / 2;
      const z = context.canvas.height / 2;
      const [a,b,c,d,e,f] = transformMatrix
      const e1 = -c*z + e*scaleFactorX + w*(1-a)
      const f1 = -b*w + f*scaleFactorX  + z*(1-d)
      const transformMatrixNew = [a,b,c,d,e1,f1]
      const w1 = w - (canvasChildWidth*scaleFactorX/2)
      const z1 = z - (canvasChildHeight*scaleFactorY/2)
      context.setTransform(...transformMatrixNew);
      context.drawImage(image, w1,z1, canvasChildWidth*scaleFactorX, canvasChildHeight*scaleFactorY);

      context.setTransform(1, 0, 0, 1, 0, 0);

    };
  }