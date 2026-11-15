const { useState, useRef, useEffect, useLayoutEffect, createContext } = React;

/**
 * Globals
 */

const CONSTANTS = {
  assetPath: "images/grabber" };


const ASSETS = {
  head: `${CONSTANTS.assetPath}/head.svg`,
  waiting: `${CONSTANTS.assetPath}/hand.svg`,
  stalking: `${CONSTANTS.assetPath}/hand-waiting.svg`,
  grabbing: `${CONSTANTS.assetPath}/hand.svg`,
  grabbed: `${CONSTANTS.assetPath}/hand-with-cursor.svg`,
  shaka: `${CONSTANTS.assetPath}/hand-surfs-up.svg` };


// Preload images
Object.keys(ASSETS).forEach(key => {
  const img = new Image();
  img.src = ASSETS[key];
});


/**
 * Shared hooks
 */

const useHover = () => {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);

  const enter = () => setHovered(true);
  const leave = () => setHovered(false);

  useEffect(
  () => {
    ref.current.addEventListener("mouseenter", enter);
    ref.current.addEventListener("mouseleave", leave);
    return () => {
      ref.current.removeEventListener("mouseenter", enter);
      ref.current.removeEventListener("mouseleave", leave);
    };
  },
  [ref]);


  return [ref, hovered];
};

// Mouse position
const useMousePosition = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const setFromEvent = e => setPosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", setFromEvent);

    return () => {
      window.removeEventListener("mousemove", setFromEvent);
    };
  }, []);

  return position;
};

// Element position
const usePosition = () => {
  const ref = useRef();
  const [position, setPosition] = useState({});

  const handleResize = () => {
    setPosition(ref.current.getBoundingClientRect());
  };

  useLayoutEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [ref.current]);

  return [ref, position];
};


/**
 * React Components
 */

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      debug: false,
      cursorGrabbed: false,
      gameOver: false };


    this.handleToggleDebug = this.handleToggleDebug.bind(this);
    this.handleButtonClicked = this.handleButtonClicked.bind(this);
    this.handleCursorGrabbed = this.handleCursorGrabbed.bind(this);
  }

  handleToggleDebug() {
    this.setState({
      debug: !this.state.debug });

  }

  handleCursorGrabbed() {
    this.setState({
      cursorGrabbed: true });

    setTimeout(() => {
      this.setState({
        cursorGrabbed: false });

    }, 2000);
  }


  handleButtonClicked() {
    this.setState({
      gameOver: true });

    setTimeout(() => {
      this.setState({
        gameOver: false });

    }, 4000);
  }

  render() {
    const { cursorGrabbed, gameOver, debug } = this.state;
    const screenStyle = cursorGrabbed ? { cursor: "none" } : {};
    const appClass = debug ? "app app--debug" : "app";

    return /*#__PURE__*/(
      React.createElement("div", { className: appClass, style: screenStyle }, /*#__PURE__*/
      React.createElement("img", { id:"myImage", src:"images/MyImage.jpg" }),
      React.createElement("section", { className: "container" }, /*#__PURE__*/
      React.createElement("h1", null, "Hi!"), /*#__PURE__*/
      React.createElement("h2", null,
        React.createElement("p", { className: "typewrite",  dataPeriod: "2000", dataType: JSON.stringify([
          'My name is Dian.',
          'I am а Senior Engineer.',
          'I am a Lecturer at SoftUni and NBU.',
          'I currently work at hedgehog lab.'
        ])},
        React.createElement("span", { className: "wrap" }))),

      React.createElement("button", {
        className: "trap-button",
        onClick: this.handleButtonClicked },
      gameOver && "DiyanKalaydzhiev23",
      cursorGrabbed && "Let's get to know each other better first.",
      !gameOver && !cursorGrabbed && "Linkedin"), /*#__PURE__*/


      React.createElement("div", { className: "grab-zone-wrapper" }, /*#__PURE__*/
      React.createElement(GrabZone, {
        onCursorGrabbed: this.handleCursorGrabbed,
        cursorGrabbed: cursorGrabbed,
        gameOver: gameOver })))));
  }}


// GrabZone (The hover trigger zone)
const GrabZone = ({ cursorGrabbed, gameOver, onCursorGrabbed }) => {
  const [outerRef, outerHovered] = useHover();
  const [innerRef, innerHovered] = useHover();
  const [isExtended, setExtendedArm] = useState(false);

  let state = "waiting";
  if (outerHovered) {
    state = "stalking";
  }
  if (innerHovered) {
    state = "grabbing";
  }
  if (cursorGrabbed) {
    state = "grabbed";
  }
  if (gameOver) {
    state = "shaka";
  }

  // If state is grabbing for a long time, they're being clever!
  useEffect(() => {
    let timer;
    if (state === "grabbing") {
      timer = setTimeout(() => {
        // Not so clever now, are they?
        setExtendedArm(true);
        timer = null;
      }, 2000);
    }
    return () => {
      setExtendedArm(false);
      if (timer) {
        clearTimeout(timer);
      }
    };
  },
  [state]);


  return /*#__PURE__*/(
    React.createElement("div", { className: "grab-zone", ref: outerRef }, /*#__PURE__*/
    React.createElement("div", { className: "grab-zone__debug" }, /*#__PURE__*/
    React.createElement("strong", null, "Debug info:"), /*#__PURE__*/
    React.createElement("p", null, "Current state: ", state), /*#__PURE__*/
    React.createElement("p", null, "Extended arm: ", isExtended ? "Yes" : "No")), /*#__PURE__*/

    React.createElement("div", { className: "grab-zone__danger", ref: innerRef }, /*#__PURE__*/
    React.createElement(Grabber, {
      state: state,
      gameOver: gameOver,
      extended: isExtended,
      onCursorGrabbed: onCursorGrabbed }))));




};

// Face (live eyes, brows and mouth drawn over the static head.svg)
const FACE_PAIR = /(-?\d*\.?\d+) (-?\d*\.?\d+)/g;
const mapPath = (d, fn) => d.replace(FACE_PAIR, (m, x, y) => {
  const [nx, ny] = fn(+x, +y);
  return `${+nx.toFixed(2)} ${+ny.toFixed(2)}`;
});
const mirrorPath = d => mapPath(d, (x, y) => [150 - x, y]);

// squint: 0 = open, 1 = narrowed
const eyePaths = s => ({
  white: `M51.5 65.5 C55.2 ${62 + 1.6 * s} 61.2 ${61.5 + 1.6 * s} 66.5 65.5 C61.2 ${68.4 - .7 * s} 56.2 ${68.4 - .7 * s} 51.5 65.5 Z`,
  lid: `M51 65.6 C55.2 ${61.7 + 1.6 * s} 61.2 ${61.2 + 1.6 * s} 67 65.3`,
  crease: `M52.5 ${62.4 + .8 * s} C56.2 ${59.6 + .8 * s} 61.2 ${59.4 + .8 * s} 66 ${62 + .8 * s}`,
  lower: `M53.3 ${67.3 - .4 * s} C57 ${68.6 - .6 * s} 61.2 ${68.6 - .6 * s} 65 ${67 - .4 * s}`,
  shadow: `M51 62 L67 62 L67 ${64.6 + 1.5 * s} C61.2 ${62 + 1.5 * s} 55.5 ${62 + 1.5 * s} 51 ${64.6 + 1.5 * s} Z` });

// brow: outer-end y, inner-end y, arch
const browPath = ([oy, iy, a]) =>
`M48.5 ${oy} C53.2 ${oy - 3.6 - a} 59.6 ${iy - 1.3 - a} 67.6 ${iy} L67.9 ${iy + 3.4} C60.4 ${iy + 2.6} 54 ${oy - .1} 49.4 ${oy + 2.3} Z`;

const MOUTH = {
  upper: "M62.5 100.8 C66 99 70 98.6 73 99.4 C74.2 99.8 75.8 99.8 77 99.4 C80 98.6 84 99 87.5 100.8 C83 101.5 79 101.8 75 101.8 C71 101.8 67 101.5 62.5 100.8 Z",
  lower: "M64 101.4 C68 105.4 82 105.4 86 101.4 C80 102.8 70 102.8 64 101.4 Z",
  shine: "M69.5 103.3 C73 104.2 77 104.2 80.5 103.3",
  line: "M62.5 100.8 C68 102.1 82 102.1 87.5 100.8",
  corners: "M62.6 100.9 L87.4 100.9" };

// mouth: [left corner dy, right corner dy, smile bend, width]
const warpMouth = (d, [dyL, dyR, bend, w]) => mapPath(d, (x, y) => {
  const t = Math.min(1, Math.max(0, (x - 62.5) / 25));
  return [75 + (x - 75) * w, y + dyL * (1 - t) + dyR * t + bend * Math.sin(Math.PI * t)];
});

const EXPRESSIONS = {
  waiting: { browL: [58.6, 55.3, 0], browR: [58.6, 55.3, 0], squint: 0, mouth: [0, 0, 0, 1] },
  stalking: { browL: [57.2, 53.4, .9], browR: [58.9, 56.4, -.3], squint: .45, mouth: [-1, .2, .2, 1] },
  grabbing: { browL: [58.4, 57.4, -.5], browR: [58.4, 57.4, -.5], squint: .35, mouth: [.2, -1.4, .3, 1] },
  extended: { browL: [57.2, 58.8, -.9], browR: [57.2, 58.8, -.9], squint: .8, mouth: [.9, .9, -.7, .94] },
  grabbed: { browL: [57.6, 54.4, .5], browR: [57.6, 54.4, .5], squint: .6, mouth: [-1.8, -1.8, 1.5, 1.06], lookAt: [-2.2, 1.2] },
  shaka: { browL: [57, 53.6, .8], browR: [57, 53.6, .8], squint: .9, mouth: [-2.9, -2.9, 2.5, 1.1] } };


const Face = ({ expression, mousePos }) => {
  const ref = useRef();
  const e = EXPRESSIONS[expression] || EXPRESSIONS.waiting;
  const h = React.createElement;

  // Irises look towards the cursor (or a fixed spot for some expressions)
  let look = e.lookAt || [0, 0];
  if (!e.lookAt && ref.current) {
    const r = ref.current.getBoundingClientRect();
    const dx = mousePos.x - (r.left + r.width * 0.5);
    const dy = mousePos.y - (r.top + r.height * 0.39);
    const dist = Math.hypot(dx, dy) || 1;
    const k = Math.min(1, dist / 120);
    look = [dx / dist * k * 2.6, dy / dist * k * 1.3];
  }
  const irisStyle = { transform: `translate(${look[0]}px, ${look[1]}px)`, transition: "transform .1s ease-out" };

  const left = eyePaths(e.squint);
  const right = {};
  Object.keys(left).forEach(k => {right[k] = mirrorPath(left[k]);});

  const eye = (paths, side, cx) => [
  h("path", { key: `w${side}`, d: paths.white, fill: "#EFE6DE" }),
  h("g", { key: `i${side}`, clipPath: `url(#gf-eye${side})` },
  h("g", { style: irisStyle },
  h("circle", { cx, cy: 65.5, r: 3.5, fill: "url(#gf-iris)" }),
  h("circle", { cx, cy: 65.5, r: 1.5, fill: "#120A06" }),
  h("circle", { cx: cx + .9, cy: 64.6, r: .7, fill: "#FFFFFF" })),
  h("path", { d: paths.shadow, fill: "#6E4636", opacity: .45, filter: "url(#gf-soft)" })),
  h("path", { key: `l${side}`, d: paths.lid, fill: "none", stroke: "#24170F", strokeWidth: 1.7, strokeLinecap: "round" }),
  h("path", { key: `c${side}`, d: paths.crease, fill: "none", stroke: "#A86F52", strokeWidth: 1, opacity: .55, strokeLinecap: "round" }),
  h("path", { key: `b${side}`, d: paths.lower, fill: "none", stroke: "#B9805F", strokeWidth: .8, opacity: .6, strokeLinecap: "round" })];


  const browL = browPath(e.browL);
  const browR = mirrorPath(browPath(e.browR));
  const m = k => warpMouth(MOUTH[k], e.mouth);
  const corners = m("corners").match(FACE_PAIR).map(p => p.split(" ").map(Number));

  return h("div", { className: "grabber__face", ref },
  h("img", { src: ASSETS.head, alt: "" }),
  h("svg", { className: "grabber__features", viewBox: "0 0 150 168", "aria-hidden": "true" },
  h("defs", null,
  h("clipPath", { id: "gf-eyeL" }, h("path", { d: left.white })),
  h("clipPath", { id: "gf-eyeR" }, h("path", { d: right.white })),
  h("radialGradient", { id: "gf-iris", cx: ".45", cy: ".4", r: ".6" },
  h("stop", { offset: "0", stopColor: "#7A4A2A" }),
  h("stop", { offset: "1", stopColor: "#3A2214" })),
  h("filter", { id: "gf-soft", x: "-30%", y: "-30%", width: "160%", height: "160%" },
  h("feGaussianBlur", { stdDeviation: ".45" }))),
  eye(left, "L", 59),
  eye(right, "R", 91),
  h("g", { fill: "#1C140F" },
  h("path", { d: browL, opacity: .6, filter: "url(#gf-soft)" }),
  h("path", { d: browL }),
  h("path", { d: browR, opacity: .6, filter: "url(#gf-soft)" }),
  h("path", { d: browR })),
  h("path", { d: m("upper"), fill: "#AD6A5A" }),
  h("path", { d: m("lower"), fill: "#C4806F" }),
  h("path", { d: m("shine"), fill: "none", stroke: "#E0A796", strokeWidth: .9, opacity: .7, strokeLinecap: "round" }),
  h("path", { d: m("line"), fill: "none", stroke: "#7A4033", strokeWidth: 1.3, strokeLinecap: "round" }),
  corners.map(([x, y], i) =>
  h("circle", { key: i, cx: x, cy: y, r: 1.1, fill: "#8A5A43", opacity: .5, filter: "url(#gf-soft)" }))));

};

// Grabber (The graphic)
const Grabber = ({ state, gameOver, extended, onCursorGrabbed }) => {
  const mousePos = useMousePosition();
  const [ref, position] = usePosition();
  const hasCursor = false;

  // Calculate rotation of armWrapper
  const x = position.left + position.width * 0.5;
  const y = position.top + position.height * 0.5;
  const angle = gameOver ? 0 : Math.atan2(mousePos.x - x, -(mousePos.y - y)) * (180 / Math.PI);

  // Ensure value is within acceptable range (-75 to 75)
  const rotation = Math.min(Math.max(parseInt(angle), -79), 79);

  const grabberClass = `grabber grabber--${state} ${extended && "grabber--extended"}`;
  const wrapperStyle = { transform: `rotate(${rotation}deg)` };

  let handImageSrc = ASSETS[state];

  return /*#__PURE__*/(
    React.createElement("div", { className: grabberClass }, /*#__PURE__*/
    React.createElement("div", { className: "grabber__body" }), /*#__PURE__*/
    React.createElement(Face, {
      expression: extended && state === "grabbing" ? "extended" : state,
      mousePos: mousePos }), /*#__PURE__*/
    React.createElement("div", { className: "grabber__arm-wrapper", ref: ref, style: wrapperStyle }, /*#__PURE__*/
    React.createElement("div", { className: "grabber__arm" }, /*#__PURE__*/
    React.createElement("img", {
      className: "grabber__hand",
      src: handImageSrc,
      onMouseEnter: onCursorGrabbed })))));
};

// Render app
ReactDOM.render( /*#__PURE__*/React.createElement(App, null), document.getElementById("app"));


function copyEmail() {
  const email = "diankostadenov@gmail.com";

  navigator.clipboard.writeText(email).then(function() {
      showNotification("Copied to clipboard: " + email);
  }).catch(function(error) {
      console.error("Error copying text: ", error);
  });
}

function showNotification(message) {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.style.display = "block";
  setTimeout(function() {
      notification.classList.add("show");
  }, 10);

  setTimeout(function() {
      notification.classList.remove("show");
      setTimeout(function() {
          notification.style.display = "none";
      }, 1000);
  }, 2500);
}
