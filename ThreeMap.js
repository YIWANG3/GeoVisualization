var THREE = require('three');
import * as d3 from 'd3-geo';
var OrbitControls = require('three-orbit-controls')(THREE);

const BASE_COLOR = "#09204f";
const HIGHLIGHT_COLOR = "#be0913";

export default class ThreeMap {
    constructor(set) {
        this.mapData = set;
        this.init();
    }

    init() {
        this.initRenderer();
        this.initCamera();
        this.initScene();
        this.render();
        this.drawMap();
        this.setControl();
        document.body.addEventListener('click', this.mouseEvent.bind(this));
    }

    //初始化渲染场景
    initRenderer() {
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor("#cac4bf");
        document.body.appendChild(this.renderer.domElement);
    }

    //初始化相机
    initCamera() {
        this.camera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 0.5, 10000);
        //向上的一个坐标系
        this.camera.up.x = 0;
        this.camera.up.y = 0;
        this.camera.up.z = 200;
        this.camera.position.set(0, 800, 800);
        this.camera.lookAt(0, 0, 0)
    }

    //初始化场景
    initScene() {
        this.scene = new THREE.Scene();
    }

    //渲染
    render() {
        this.animate()
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        // this.camera.position.x += 0.1;
        // this.camera.position.y -= 0.4;
        // this.camera.position.z -= 0.4;
        this.renderer.render(this.scene, this.camera);
    }

    setHelper() {
        //红色x,绿色y,蓝色z
        const axesHelper = new THREE.AxisHelper(5);
        this.scene.add(axesHelper);
    }

    //绘制线条
    drawLine(points) {
        const material = new THREE.LineBasicMaterial({
            color: '#fff',
            transparent: true,
            opacity: 0.8,
        });
        const geometry = new THREE.Geometry();
        points.forEach(d => {
            const [x, y, z] = d;
            geometry.vertices.push(new THREE.Vector3(x, y, z));
        });

        const line = new THREE.Line(geometry, material);
        return line;
    }

    drawMap() {
        this.vector3Json = [];
        this.mapData.features.forEach(element => {
            for (let k = 0; k < element.geometry.coordinates.length; k++) {
                const areas = element.geometry.coordinates[k];
                const areaData = {...element.properties, coordinates: []};
                //通过循环，区分坐标或数组
                areas.forEach((area, i) => {
                    if (area[0] instanceof Array) {
                        areaData.coordinates[i] = [];
                        area.forEach(areaInner => {
                            areaData.coordinates[i].push(this.lnglatToVector(areaInner))
                        })
                    } else {
                        areaData.coordinates.push(this.lnglatToVector(area))
                    }
                });
                this.vector3Json[element.properties.name] = areaData;
                this.vector3Json.push(areaData);
            }
        });
        //绘制模块
        const group = new THREE.Group();
        const lineGroup = new THREE.Line();
        this.vector3Json.forEach(provinces => {
            if (provinces.coordinates[0][0] instanceof Array) {
                provinces.coordinates.forEach(area => {
                    const mesh = this.getAreaMesh(area);
                    group.add(mesh);
                    const line = this.drawLine(area);
                    lineGroup.add(line);
                })
            } else { //单面
                const mesh = this.getAreaMesh(provinces.coordinates);
                group.add(mesh);
                const line = this.drawLine(provinces.coordinates);
                lineGroup.add(line);
            }
        });
        this.group = group;
        group.rotation.y = Math.PI;
        lineGroup.rotation.y = Math.PI;
        this.scene.add(group);
        this.scene.add(lineGroup);
    }

    //绘制网格
    getAreaMesh(points) {
        const shape = new THREE.Shape(); //实例一个形状

        points.forEach((p, i) => {
            const [x, y] = p;
            if (i === 0) {
                shape.moveTo(x, y);
            } else if (i === points.length - 1) {
                shape.quadraticCurveTo(x, y, x, y) //二次曲线
            } else {
                shape.lineTo(x, y, x, y);
            }
        });
        //几何体
        const geometry = new THREE.ExtrudeGeometry(
            shape, {depth: 3, bevelEnabled: false} //启用斜角
        );
        //材质
        const material = new THREE.MeshBasicMaterial({
            color: BASE_COLOR,
            transparent: true,
            opacity: 0.5,
        });

        //合并成一个网格模型
        const mesh = new THREE.Mesh(geometry, material);
        return mesh;
    }

    //经纬度转三维坐标
    lnglatToVector(lnglat) {
        if (!this.projection) {
            this.projection = d3
                .geoMercator() //获取墨卡托坐标方法
                .center([-800, 60])
                .translate([80, -80]);
        }
        const [y, x] = this.projection([...lnglat]);
        let z = 0;
        return [y, x, z];
    }

    setControl() {
        this.controls = new OrbitControls(this.camera);
        this.controls.update();
    }

    mouseEvent(event) {
        if (!this.raycaster)
            this.raycaster = new THREE.Raycaster();
        if (!this.mouse)
            this.mouse = new THREE.Vector2();

        // 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +1)
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // 通过摄像机和鼠标位置更新射线
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // 计算物体和射线的焦点
        const intersects = this.raycaster.intersectObjects(this.group.children);
        this.group.children.forEach(mesh => {
            mesh.material.color.set(BASE_COLOR);
        });
        for (var i = 0; i < intersects.length; i++) {
            intersects[i].object.material.color.set(HIGHLIGHT_COLOR);
        }
    }
}
