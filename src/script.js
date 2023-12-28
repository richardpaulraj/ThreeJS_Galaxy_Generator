import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'


// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

//Textures
const textureLoader = new THREE.TextureLoader()
const  particleTexture = textureLoader.load('/particles/8.png')


//Parameters
const parameters = {}
parameters.count = 100000
parameters.size = 0.01
parameters.radius = 5
parameters.branches = 15
parameters.spin = 0.75
parameters.randomness = 0.2
parameters.randomnessPower = 10
parameters.insideColor = '#ff6030'
parameters.outsideColor = '#1b3984'
parameters.rotate = true,

parameters.y_axis1 = -0.8,
parameters.y_axis2 = 0.8


 

//I added points outside because I wanted to tweak the values(rotation and reducing the y axis size of both to make it equal) outside the function
let points = {
    1:null,
    2:null
}


const generateGalaxy = (selectGeometry)=>{


    //This is usefull only for tweaking the values in the control panel

    // if(points[selectGeometry] !== null){
    //     geometry[selectGeometry].dispose()
    //     material[selectGeometry].dispose()
    //     scene.remove(points[selectGeometry])
    // }

    const geometry = new THREE.BufferGeometry()

    const positions = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)   

    const colorsInside = new THREE.Color(parameters.insideColor)
    const colorsOutside = new THREE.Color(parameters.outsideColor)

    for(let i  = 0; i < parameters.count; i++){

        const i3 = i * 3


        //Positions
        const radius = Math.random() * parameters.radius
        const spinAngle = radius * parameters.spin
        const branchAngle = ( (i % parameters.branches) / parameters.branches ) * Math.PI * 2

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius
        // const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius
        

        positions[i3 + 0] = Math.cos(branchAngle + spinAngle) * radius + randomX  // X
        positions[i3 + 1] =  parameters[`y_axis${selectGeometry}`] / radius   // Y
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ  // Z


        //Colors

        const mixedColor = colorsInside.clone()
        mixedColor.lerp(colorsOutside,radius / parameters.radius)

        colors[i3 + 0] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b

    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))



    //Material 

    const material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation : true,

        transparent:true,
        alphaMap:particleTexture,

        depthWrite : false,
        blending: THREE.AdditiveBlending,
        vertexColors:true
    })


    //Points

    points[selectGeometry] = new THREE.Points(geometry,material)
    scene.add(points[selectGeometry])

}


generateGalaxy(1)
generateGalaxy(2)


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Camera

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 2.75
camera.position.y = 1
camera.position.z = 5.5
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

//Renderer

const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

//Clock
const clock = new THREE.Clock()

//To keep the gap between those two Galaxy equal
points[1].position.y = 0
points[2].position.y = -0.325

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    //Geometry rotate
    if(parameters.rotate){
        points[1].rotation.y = elapsedTime * 0.08
        points[2].rotation.y = elapsedTime * 0.08
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()