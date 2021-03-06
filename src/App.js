import {useState} from 'react';
import './App.css';
import styled from 'styled-components';
import ReactCardFlip from 'react-card-flip';

function App() {
    //Blob Canvas
    {
        let canvas, ctx;
        let render, init;
        let blob;

        class Blob {
        constructor() {
            this.points = [];
        }
        
        init() {
            for(let i = 0; i < this.numPoints; i++) {
            let point = new Point(this.divisional * ( i + 1 ), this);
            // point.acceleration = -1 + Math.random() * 2;
            this.push(point);
            }
        }
        
        render() {
            let canvas = this.canvas;
            let ctx = this.ctx;
            let position = this.position;
            let pointsArray = this.points;
            let radius = this.radius;
            let points = this.numPoints;
            let divisional = this.divisional;
            let center = this.center;
            
            ctx.clearRect(0,0,canvas.width,canvas.height);
            
            pointsArray[0].solveWith(pointsArray[points-1], pointsArray[1]);

            let p0 = pointsArray[points-1].position;
            let p1 = pointsArray[0].position;
            let _p2 = p1;

            ctx.beginPath();
            ctx.moveTo(center.x, center.y);
            ctx.moveTo( (p0.x + p1.x) / 2, (p0.y + p1.y) / 2 );

            for(let i = 1; i < points; i++) {
            
            pointsArray[i].solveWith(pointsArray[i-1], pointsArray[i+1] || pointsArray[0]);

            let p2 = pointsArray[i].position;
            var xc = (p1.x + p2.x) / 2;
            var yc = (p1.y + p2.y) / 2;
            ctx.quadraticCurveTo(p1.x, p1.y, xc, yc);
            // ctx.lineTo(p2.x, p2.y);

            ctx.fillStyle = '#000000';
            // ctx.fillRect(p1.x-2.5, p1.y-2.5, 5, 5);

            p1 = p2;
            }

            var xc = (p1.x + _p2.x) / 2;
            var yc = (p1.y + _p2.y) / 2;
            ctx.quadraticCurveTo(p1.x, p1.y, xc, yc);
            // ctx.lineTo(_p2.x, _p2.y);

            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.strokeStyle = '#000000';
            ctx.stroke();
            
        /*
            ctx.fillStyle = '#000000';
            if(this.mousePos) {
            let angle = Math.atan2(this.mousePos.y, this.mousePos.x) + Math.PI;
            ctx.fillRect(center.x + Math.cos(angle) * this.radius, center.y + Math.sin(angle) * this.radius, 5, 5);
            }
        */
            requestAnimationFrame(this.render.bind(this));
        }
        
        push(item) {
            if(item instanceof Point) {
            this.points.push(item);
            }
        }
        
        set color(value) {
            this._color = value;
        }
        get color() {
            return this._color || '#30DFA3';
        }
        
        set canvas(value) {
            if(value instanceof HTMLElement && value.tagName.toLowerCase() === 'canvas') {
            this._canvas = canvas;
            this.ctx = this._canvas.getContext('2d');
            }
        }
        get canvas() {
            return this._canvas;
        }
        
        set numPoints(value) {
            if(value > 2) {
            this._points = value;
            }
        }
        get numPoints() {
            return this._points || 32;
        }
        
        set radius(value) {
            if(value > 0) {
            this._radius = value;
            }
        }
        get radius() {
            return this._radius || 580;
        }
        
        set position(value) {
            if(typeof value == 'object' && value.x && value.y) {
            this._position = value;
            }
        }
        get position() {
            return this._position || { x: 0.15, y: 0.25 };
        }
        
        get divisional() {
            return Math.PI * 2 / this.numPoints;
        }
        
        get center() {
            return { x: this.canvas.width * this.position.x, y: this.canvas.height * this.position.y };
        }
        
        set running(value) {
            this._running = value === true;
        }
        get running() {
            return this.running !== false;
        }
        }

        class Point {
        constructor(azimuth, parent) {
            this.parent = parent;
            this.azimuth = Math.PI - azimuth;
            this._components = { 
            x: Math.cos(this.azimuth),
            y: Math.sin(this.azimuth)
            };
            
            this.acceleration = -0.3 + Math.random() * 0.6;
        }
        
        solveWith(leftPoint, rightPoint) {
            this.acceleration = (-0.3 * this.radialEffect + ( leftPoint.radialEffect - this.radialEffect ) + ( rightPoint.radialEffect - this.radialEffect )) * this.elasticity - this.speed * this.friction;
        }
        
        set acceleration(value) {
            if(typeof value == 'number') {
            this._acceleration = value;
            this.speed += this._acceleration * 2;
            }
        }
        get acceleration() {
            return this._acceleration || 0;
        }
        
        set speed(value) {
            if(typeof value == 'number') {
            this._speed = value;
            this.radialEffect += this._speed * 5;
            }
        }
        get speed() {
            return this._speed || 0;
        }
        
        set radialEffect(value) {
            if(typeof value == 'number') {
            this._radialEffect = value;
            }
        }
        get radialEffect() {
            return this._radialEffect || 0;
        }
        
        get position() {
            return { 
            x: this.parent.center.x + this.components.x * (this.parent.radius + this.radialEffect), 
            y: this.parent.center.y + this.components.y * (this.parent.radius + this.radialEffect) 
            }
        }
        
        get components() {
            return this._components;
        }

        set elasticity(value) {
            if(typeof value === 'number') {
            this._elasticity = value;
            }
        }
        get elasticity() {
            return this._elasticity || 0.001;
        }
        set friction(value) {
            if(typeof value === 'number') {
            this._friction = value;
            }
        }
        get friction() {
            return this._friction || 0.0085;
        }
        }

        blob = new Blob;

        init = function() {
        canvas = document.createElement('canvas');
        canvas.setAttribute('touch-action', 'none');

        document.body.appendChild(canvas);

        let resize = function() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resize);
        resize();
        
        let oldMousePoint = { x: 0, y: 0};
        let hover = false;
        let mouseMove = function(e) {
            
            let pos = blob.center;
            let diff = { x: e.clientX - pos.x, y: e.clientY - pos.y };
            let dist = Math.sqrt((diff.x * diff.x) + (diff.y * diff.y));
            let angle = null;
            
            blob.mousePos = { x: pos.x - e.clientX, y: pos.y - e.clientY };
            
            if(dist < blob.radius && hover === false) {
            let vector = { x: e.clientX - pos.x, y: e.clientY - pos.y };
            angle = Math.atan2(vector.y, vector.x);
            hover = true;
            // blob.color = '#77FF00';
            } else if(dist > blob.radius && hover === true){ 
            let vector = { x: e.clientX - pos.x, y: e.clientY - pos.y };
            angle = Math.atan2(vector.y, vector.x);
            hover = false;
            blob.color = null;
            }
            
            if(typeof angle == 'number') {
            
            let nearestPoint = null;
            let distanceFromPoint = 100;
            
            blob.points.forEach((point)=> {
                if(Math.abs(angle - point.azimuth) < distanceFromPoint) {
                // console.log(point.azimuth, angle, distanceFromPoint);
                nearestPoint = point;
                distanceFromPoint = Math.abs(angle - point.azimuth);
                }
                
            });
            
            if(nearestPoint) {
                let strength = { x: oldMousePoint.x - e.clientX, y: oldMousePoint.y - e.clientY };
                strength = Math.sqrt((strength.x * strength.x) + (strength.y * strength.y)) * 10;
                if(strength > 100) strength = 100;
                nearestPoint.acceleration = strength / 100 * (hover ? -1 : 1);
            }
            }
            
            oldMousePoint.x = e.clientX;
            oldMousePoint.y = e.clientY;
        }
        // window.addEventListener('mousemove', mouseMove);
        window.addEventListener('pointermove', mouseMove);
        
        blob.canvas = canvas;
        blob.init();
        blob.render();
        }

        init();
    }

    const [isFlipped, setisFlipped] = useState(false);

    function handelClick(e){
        e.preventDefault();
        setisFlipped( prevState => !prevState);
    }

return (
    <Container>
        {/* npm install react-card-flip */}
        <ReactCardFlip flipSpeedFrontToBack={0.6} isFlipped={isFlipped} flipDirection='vertical'>
            <Card1>
                <Title>
                    <p>Hey There!</p>
                </Title>
                {/*Use onClick function to perform the sign in. (using firebase or choice)*/}
                <GoogleAuthProvider>
                    <i className="fab fa-google"></i><p>Sign in with Google</p>
                </GoogleAuthProvider>
                <Line><p>or</p></Line>
                {/* Use onChange function store input value to a state*/}
                <Email>
                    <label>Email</label>
                    <input type="email" placeholder="mail@example.com"></input>
                </Email>
                {/* Use onChange function store input value to a state*/}
                <Password>
                    <label>Password</label>
                    <input type="password" placeholder="**********"></input>
                </Password>
                {/*Use onClick function to perform the sign in*/}
                <SignIn>
                    <p>Sign In</p>
                </SignIn>
                {/* link to other pages*/}
                <OtherLinks>
                    <small onClick={handelClick}>Forgot Password?</small>
                    <p>Don't have an account? <small href="#">Sign Up</small></p>
                </OtherLinks>
            </Card1>
            <Card2>
                <Email>
                    <label>Email</label>
                    <input type="email" placeholder="mail@example.com"></input>
                </Email>
                {/* Use onChange function store input value to a state*/}
                <Password>
                    <label>New Password</label>
                    <input type="password" placeholder="**********"></input>
                </Password>
                <SignIn>
                    <p>Sign In</p>
                </SignIn>
                <OtherLinks>
                    <p>Already have an account? <small onClick={handelClick}>Login</small></p>
                </OtherLinks>
            </Card2>
        </ReactCardFlip>
    </Container>
);
}

export default App;

const Container = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    top: 50%;
    left: 50%;
    position: absolute;
    z-index: 9999;
    transform: translate(-50%,-50%);
    background: white;
    border-radius: 4px;
    box-shadow: 0px 0px 13px -4px #000000;
    color: #0C090A;
`

const Card1 = styled.div`
    max-height: 400px;
    width: clamp(300px, 50vw, 357px);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 30px;
`
const Title = styled.div`
    margin: 5px;
`
const GoogleAuthProvider = styled.div`
    border: 1px solid #4285F4;
    padding: 10px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #4285F4;
    margin: 10px;
    width: 100%;
    p{
        margin-left: 10px;
    }
`
const Line = styled.div`
    border-top: 1px solid lightgray;
    width: 80%;
    margin: 10px;
    p{
        position: absolute;
        right: 43%;
        top: 28.5%;
        background-color: white;
        width: 50px;
        text-align: center;
    }
`
const Email = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    margin: 10px;
    input{
        padding: 5px;
        height: 40px;
        border-radius: 5px;
        outline: none;
        border: 1px solid lightgray;
    }
`
const Password = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    margin: 10px;
    input{
        padding: 5px;
        height: 40px;
        border-radius: 5px;
        outline: none;
        border: 1px solid lightgray;
    }
`
const SignIn = styled.div`
    width: 100%;
    height: 40px;
    display: flex;
    padding: 10px;
    justify-content: center;
    align-items: center;
    margin: 10px;
    border-radius: 5px;
    /* border: 1px solid lightgray; */
    cursor: pointer;
    transition: all 0.5s ease;
    :hover{
        background-color: #2EDFA3;
    }
`
const OtherLinks = styled.div`
    margin: 5px;
    width:100%;
    display: flex;
    justify-content: center;
    font-size: 0.57rem;
    small{
        color: #2EDFA3;
        font-size: 0.57rem;
        cursor: pointer;
    }
    p{
        margin-left: 10px;
    }
`

const Card2 = styled.div`
    min-height: 400px;
    width: clamp(300px, 50vw, 357px);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 30px;
`