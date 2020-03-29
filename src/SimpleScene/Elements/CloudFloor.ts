import * as bjs from 'babylonjs';
import { Scene, SceneElement } from '../../glsg';
import { AssetManager } from '../../glsg/lib/AssetManager';



export class CloudFloor extends SceneElement
{
    public cloudMesh: bjs.Mesh;
    private cloudMaterial : bjs.ShaderMaterial;
    private  startTime : number = Date.now();

    constructor(public name: string, public x: number, public y: number, public z: number, scene: Scene<bjs.Camera>)
    {
        super(name, x, y, z, scene);
        this.create();
    }

    async create()
    {
        var start_time = Date.now();

        // Creating background layer using a dynamic texture with 2D canvas
        let background : bjs.Layer = new bjs.Layer("back0", null, this.scene.bjsScene);
        let backGroundTexture : bjs.DynamicTexture = new bjs.DynamicTexture("dynamic texture", 512, this.scene.bjsScene, true);
        var textureContext = backGroundTexture.getContext();
        let size : bjs.ISize = backGroundTexture.getSize();
        background.texture = backGroundTexture;
        textureContext.clearRect(0, 0, size.width, size.height);

        let gradient: CanvasGradient = textureContext.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, "#1e4877");
        gradient.addColorStop(0.5, "#4584b4");

        textureContext.fillStyle = gradient;
        textureContext.fillRect(0, 0, 512, 512);
        backGroundTexture.update();

        /*
        var camera = new bjs.FreeCamera("camera", new bjs.Vector3(0, -128, 0), scene);
        camera.fov = 30;
        camera.minZ = 1;
        camera.maxZ = 3000;
        */

        bjs.Effect.ShadersStore["cloudVertexShader"] = `

            #ifdef GL_ES
            precision highp float;
            #endif

            // Attributes
            attribute vec3 position;
            attribute vec2 uv;

            // Uniforms
            uniform mat4 worldViewProjection;

            // Normal
            varying vec2 vUV;

            void main(void) {
            gl_Position = worldViewProjection * vec4(position, 1.0);

            vUV = uv;
            }	        
            `;

        bjs.Effect.ShadersStore["cloudFragmentShader"] = `
            #ifdef GL_ES
            precision highp float;
            #endif

            varying vec2 vUV;

            uniform vec3 fogColor;
            uniform float fogNear;
            uniform float fogFar;

            // Refs
            uniform sampler2D textureSampler;

            void main(void) {
            float depth = gl_FragCoord.z / gl_FragCoord.w;
            float fogFactor = smoothstep(fogNear, fogFar, depth);

            gl_FragColor = texture2D(textureSampler, vUV);
            gl_FragColor.w *= pow(abs(gl_FragCoord.z), 20.0);
            gl_FragColor = mix(gl_FragColor, vec4(fogColor, gl_FragColor.w), fogFactor);
            }    
        `

        this.cloudMaterial = new bjs.ShaderMaterial("cloud", this.scene.bjsScene,
        {
            vertexElement: "cloud",
            fragmentElement: "cloud"
        },
        {
            needAlphaBlending: true,
            attributes: ["position", "uv"],
            uniforms: ["worldViewProjection"],
            samplers: ["textureSampler"]
        });

        this.cloudMaterial.setTexture("textureSampler", AssetManager.Instance.textureMap.get("cloudTexture"));
        this.cloudMaterial.setFloat("fogNear", -100);
        this.cloudMaterial.setFloat("fogFar", 3000);
        this.cloudMaterial.setColor3("fogColor", bjs.Color3.FromInts(69, 132, 180));

    // Create merged planes
        //size = 128;
        var count = 8000;

        var globalVertexData;

        for (var i = 0; i < count; i++) {
            var planeVertexData = bjs.VertexData.CreatePlane({ size: 128 });

            delete planeVertexData.normals; // We do not need normals

            // Transform
            var randomScaling = Math.random() * Math.random() * 1.5 + 0.5;
            var transformMatrix = bjs.Matrix.Scaling(randomScaling, randomScaling, 1.0);
            transformMatrix = transformMatrix.multiply(bjs.Matrix.RotationZ(Math.random() * Math.PI));
            transformMatrix = transformMatrix.multiply(bjs.Matrix.Translation(Math.random() * 1000 - 500, -Math.random() * Math.random() * 100, count - i));

            planeVertexData.transform(transformMatrix);

            // Merge
            if (!globalVertexData) {
                globalVertexData = planeVertexData;
            } else {
                globalVertexData.merge(planeVertexData);
            }
        }

        this.cloudMesh = new bjs.Mesh("Clouds", this.scene.bjsScene);
        globalVertexData.applyToMesh(this.cloudMesh);

        this.cloudMesh.material = this.cloudMaterial;
        this.cloudMesh.position.y = 175;
        //this.cloudMesh.rotation.z = Math.PI;
        this.cloudMesh.parent = this;

        //var clouds2 = clouds.clone();
        //clouds2.position.z = -500;
    }

    protected onRender()
    {
        var cameraDepth = ((Date.now() - this.startTime) * 0.03) % 8000;
        this.cloudMesh.position.z = cameraDepth * -1;
        //camera.position.z = cameraDepth;

        //this.rotation.y += 0.01;
    }
}
