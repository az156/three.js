import {
    BufferGeometry,
    Float32BufferAttribute,
    LineSegments,
    LineBasicMaterial,
    Vector3,
} from 'three';

const _startPoint = new Vector3();
const _endPoint = new Vector3();

const _vertexA = new Vector3();
const _vertexB = new Vector3();
const _vertexC = new Vector3();

const _vectorAB = new Vector3();
const _vectorAC = new Vector3();

const _faceNormal = new Vector3();

class FaceNormalsHelper extends LineSegments {
    constructor(object, size = 1, color = 0xff0000) {
        const geometry = new BufferGeometry();

        const objGeometry = object.geometry;

        const nFaces = objGeometry.index
            ? objGeometry.index.count / 3
            : objGeometry.attributes.position.count / 3;

        const positions = new Float32BufferAttribute(nFaces * 2 * 3, 3);

        geometry.setAttribute('position', positions);

        super(geometry, new LineBasicMaterial({ color, toneMapped: false }));

        this.object = object;
        this.size = size;
        this.type = 'FaceNormalsHelper';

        this.matrixAutoUpdate = false;

        this.update();
    }

    update() {
        this.object.updateMatrixWorld(true);

        const matrixWorld = this.object.matrixWorld;

        const position = this.geometry.attributes.position;

        const objGeometry = this.object.geometry;

        if (objGeometry) {
            const objPos = objGeometry.attributes.position;

            let idx = 0;

            const processTriangle = (idxA, idxB, idxC) => {
                this.calculateFaceNormal(objPos, idxA, idxB, idxC, matrixWorld);
                position.setXYZ(idx++, _startPoint.x, _startPoint.y, _startPoint.z);
                position.setXYZ(idx++, _endPoint.x, _endPoint.y, _endPoint.z);
            };

            const index = objGeometry.index;

            if (index) {
                for (let i = 0; i < index.count; i += 3) {
                    processTriangle(index.getX(i), index.getX(i + 1), index.getX(i + 2));
                }
            } else {
                for (let i = 0; i < objPos.count; i += 3) {
                    processTriangle(i, i + 1, i + 2);
                }
            }
        }
        position.needsUpdate = true;
    }

    calculateFaceNormal(position, idxA, idxB, idxC, matrixWorld) {
        _vertexA.fromBufferAttribute(position, idxA).applyMatrix4(matrixWorld);
        _vertexB.fromBufferAttribute(position, idxB).applyMatrix4(matrixWorld);
        _vertexC.fromBufferAttribute(position, idxC).applyMatrix4(matrixWorld);

        _startPoint.addVectors(_vertexA, _vertexB).add(_vertexC).multiplyScalar(1 / 3);

        _vectorAB.subVectors(_vertexB, _vertexA);
        _vectorAC.subVectors(_vertexC, _vertexA);

        _faceNormal.crossVectors(_vectorAB, _vectorAC).setLength(this.size);

        _endPoint.addVectors(_startPoint, _faceNormal);
    }

    dispose() {
        this.geometry.dispose();
        this.material.dispose();
    }
}

export { FaceNormalsHelper };