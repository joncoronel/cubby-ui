# Feedback popover

A button that morphs into a popover.

## Button to popover

Let's animate the first part of the component where the feedback button becomes the feedback popover. You will need to be a bit creative here. One hint I'll give you is that the gray feedback text inside the popover is not the actual placeholder of the textarea, it's a separate html element.

Success criteria:

- The button should morph into the popover.
- The placeholder should disappear when the user starts typing.

                  </button>
                </div>
              </form>
            )}
          </div>
        ) : null}
      </div>

  );
  }`,
"/Spinner.js": `import { clsx } from "clsx";
  import "./styles.css";

const bars = Array(12).fill(0);

export function Spinner({
color,
size = 20,
}) {
return (
<div
className="wrapper"
style={{
        ["--spinner-size"]: `${size}px`,
        ["--spinner-color"]: color,
      }} >
<div className="spinner">
{bars.map((\_, i) => (
<div className="bar" key={`spinner-bar-${i}`} />
))}
</div>
</div>
);
}`,
 "/styles.css": `.feedback-wrapper {
height: 500px;
display: flex;
justify-content: center;
align-items: center;
width: 100%;
}

.feedback-button {
position: relative;
display: flex;
height: 36px;
align-items: center;
border-radius: 8px;
border: 1px solid #e9e9e7;
background: white;
padding: 0 12px;
font-weight: 500;
outline: none;
}

.feedback-button span {
display: block;
font-size: 14px;
}

.feedback-popover {
position: absolute;
height: 192px;
width: 364px;
overflow: hidden;
border-radius: 12px;
background: #f5f6f7;
padding: 4px;
box-shadow:
0 0 0 1px rgba(0, 0, 0, 0.08),
0px 2px 2px rgba(0, 0, 0, 0.04);
outline: none;
}

.placeholder {
position: absolute;
font-size: 14px;
color: #63635d;
left: 16px;
top: 17px;
}

.success-wrapper {
display: flex;
height: 100%;
flex-direction: column;
align-items: center;
justify-content: center;
}

.success-wrapper svg {
margin-top: -4px;
}

.success-wrapper h3 {
margin-bottom: 4px;
margin-top: 8px;
font-size: 14px;
font-weight: 500;
color: #21201c;
}

.success-wrapper p {
font-size: 14px;
color: #63635d;
}

.feedback-form {
border-radius: 8px;
border: 1px solid #e6e7e8;
background: white;
}

.textarea {
width: 100%;
height: 128px;
resize: none;
border-radius: 8px 0;
padding: 12px;
font-size: 14px;
outline: none;
}

.textarea::placeholder {
opacity: 0;
}

.feedback-footer {
position: relative;
display: flex;
height: 48px;
align-items: center;
padding: 0 10px;
}

.dotted-line {
position: absolute;
left: 0;
right: 0;
top: -1px;
}

.half-circle-left {
position: absolute;
left: 0;
top: 0;
transform: translateX(-1.5px) translateY(-50%);
}

.half-circle-right {
position: absolute;
right: 0;
top: 0;
transform: translateX(1.5px) translateY(-50%) rotate(180deg);
}

.submit-button {
margin-left: auto;
display: flex;
align-items: center;
justify-content: center;
border-radius: 6px;
font-weight: 600;
font-size: 12px;
height: 24px;
width: 104px;
overflow: hidden;
background: linear-gradient(180deg, #1994ff 0%, #157cff 100%);
box-shadow:
0px 0px 1px 1px rgba(255, 255, 255, 0.08) inset,
0px 1px 1.5px 0px rgba(0, 0, 0, 0.32),
0px 0px 0px 0.5px #1a94ff;
position: relative;
}

.submit-button span {
display: flex;
width: 100%;
align-items: center;
justify-content: center;
color: white;
text-shadow: 0px 1px 1.5px rgba(0, 0, 0, 0.16);
}

.wrapper {
height: var(--spinner-size, 20px);
width: var(--spinner-size, 20px);
}

.spinner {
position: relative;
top: 50%;
left: 50%;
height: var(--spinner-size, 20px);
width: var(--spinner-size, 20px);
}

.bar {
animation: spin 1.2s linear infinite;
background: var(--spinner-color);
border-radius: 6px;
height: 8%;
left: -10%;
position: absolute;
top: -3.9%;
width: 24%;
}

.bar:nth-child(1) {
animation-delay: -1.2s;
transform: rotate(0.0001deg) translate(146%);
}

.bar:nth-child(2) {
animation-delay: -1.1s;
transform: rotate(30deg) translate(146%);
}

.bar:nth-child(3) {
animation-delay: -1s;
transform: rotate(60deg) translate(146%);
}

.bar:nth-child(4) {
animation-delay: -0.9s;
transform: rotate(90deg) translate(146%);
}

.bar:nth-child(5) {
animation-delay: -0.8s;
transform: rotate(120deg) translate(146%);
}

.bar:nth-child(6) {
animation-delay: -0.7s;
transform: rotate(150deg) translate(146%);
}

.bar:nth-child(7) {
animation-delay: -0.6s;
transform: rotate(180deg) translate(146%);
}

.bar:nth-child(8) {
animation-delay: -0.5s;
transform: rotate(210deg) translate(146%);
}

.bar:nth-child(9) {
animation-delay: -0.4s;
transform: rotate(240deg) translate(146%);
}

.bar:nth-child(10) {
animation-delay: -0.3s;
transform: rotate(270deg) translate(146%);
}

.bar:nth-child(11) {
animation-delay: -0.2s;
transform: rotate(300deg) translate(146%);
}

.bar:nth-child(12) {
animation-delay: -0.1s;
transform: rotate(330deg) translate(146%);
}

@keyframes spin {
0% {
opacity: 1;
}
100% {
opacity: 0.15;
}
}`,
}}
/>

                  </button>
                </div>
              </form>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>

);
}`} />
</ViewSolution>

## Success state

Let's now animate the success state, the form should disappear to the bottom, and the success ui should come from top, with a slight blur.

Success criteria:

- The form and the success ui should animate simultaneously.
- The success state should come from the top.
- Exit animation should morph the success state into the button.

                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

  );
  }`,
"/Spinner.jsx": `import { clsx } from "clsx";
  import "./styles.css";

const bars = Array(12).fill(0);

export function Spinner({
color,
size = 20,
}) {
return (
<div
className="wrapper"
style={{
        ["--spinner-size"]: `${size}px`,
        ["--spinner-color"]: color,
      }} >
<div className="spinner">
{bars.map((\_, i) => (
<div className="bar" key={`spinner-bar-${i}`} />
))}
</div>
</div>
);
}`,
 "/styles.css": `.feedback-wrapper {
height: 500px;
display: flex;
justify-content: center;
align-items: center;
width: 100%;
}

.feedback-button {
position: relative;
display: flex;
height: 36px;
align-items: center;
border-radius: 8px;
border: 1px solid #e9e9e7;
background: white;
padding: 0 12px;
font-weight: 500;
outline: none;
}

.feedback-button span {
display: block;
font-size: 14px;
}

.feedback-popover {
position: absolute;
height: 192px;
width: 364px;
overflow: hidden;
border-radius: 12px;
background: #f5f6f7;
padding: 4px;
box-shadow:
0 0 0 1px rgba(0, 0, 0, 0.08),
0px 2px 2px rgba(0, 0, 0, 0.04);
outline: none;
}

.placeholder {
position: absolute;
font-size: 14px;
color: #63635d;
left: 16px;
top: 17px;
}

.placeholder[data-feedback="true"] {
opacity: 0 !important;
}

.success-wrapper {
display: flex;
height: 100%;
flex-direction: column;
align-items: center;
justify-content: center;
}

.success-wrapper svg {
margin-top: -4px;
}

.success-wrapper h3 {
margin-bottom: 4px;
margin-top: 8px;
font-size: 14px;
font-weight: 500;
color: #21201c;
}

.success-wrapper p {
font-size: 14px;
color: #63635d;
}

.feedback-form {
border-radius: 8px;
border: 1px solid #e6e7e8;
background: white;
}

.textarea {
width: 100%;
height: 128px;
resize: none;
border-radius: 8px 0;
padding: 12px;
font-size: 14px;
outline: none;
}

.textarea::placeholder {
opacity: 0;
}

.feedback-footer {
position: relative;
display: flex;
height: 48px;
align-items: center;
padding: 0 10px;
}

.dotted-line {
position: absolute;
left: 0;
right: 0;
top: -1px;
}

.half-circle-left {
position: absolute;
left: 0;
top: 0;
transform: translateX(-1.5px) translateY(-50%);
}

.half-circle-right {
position: absolute;
right: 0;
top: 0;
transform: translateX(1.5px) translateY(-50%) rotate(180deg);
}

.submit-button {
margin-left: auto;
display: flex;
align-items: center;
justify-content: center;
border-radius: 6px;
font-weight: 600;
font-size: 12px;
height: 24px;
width: 104px;
overflow: hidden;
background: linear-gradient(180deg, #1994ff 0%, #157cff 100%);
box-shadow:
0px 0px 1px 1px rgba(255, 255, 255, 0.08) inset,
0px 1px 1.5px 0px rgba(0, 0, 0, 0.32),
0px 0px 0px 0.5px #1a94ff;
position: relative;
}

.submit-button span {
display: flex;
width: 100%;
align-items: center;
justify-content: center;
color: white;
text-shadow: 0px 1px 1.5px rgba(0, 0, 0, 0.16);
}

.wrapper {
height: var(--spinner-size, 20px);
width: var(--spinner-size, 20px);
}

.spinner {
position: relative;
top: 50%;
left: 50%;
height: var(--spinner-size, 20px);
width: var(--spinner-size, 20px);
}

.bar {
animation: spin 1.2s linear infinite;
background: var(--spinner-color);
border-radius: 6px;
height: 8%;
left: -10%;
position: absolute;
top: -3.9%;
width: 24%;
}

.bar:nth-child(1) {
animation-delay: -1.2s;
transform: rotate(0.0001deg) translate(146%);
}

.bar:nth-child(2) {
animation-delay: -1.1s;
transform: rotate(30deg) translate(146%);
}

.bar:nth-child(3) {
animation-delay: -1s;
transform: rotate(60deg) translate(146%);
}

.bar:nth-child(4) {
animation-delay: -0.9s;
transform: rotate(90deg) translate(146%);
}

.bar:nth-child(5) {
animation-delay: -0.8s;
transform: rotate(120deg) translate(146%);
}

.bar:nth-child(6) {
animation-delay: -0.7s;
transform: rotate(150deg) translate(146%);
}

.bar:nth-child(7) {
animation-delay: -0.6s;
transform: rotate(180deg) translate(146%);
}

.bar:nth-child(8) {
animation-delay: -0.5s;
transform: rotate(210deg) translate(146%);
}

.bar:nth-child(9) {
animation-delay: -0.4s;
transform: rotate(240deg) translate(146%);
}

.bar:nth-child(10) {
animation-delay: -0.3s;
transform: rotate(270deg) translate(146%);
}

.bar:nth-child(11) {
animation-delay: -0.2s;
transform: rotate(300deg) translate(146%);
}

.bar:nth-child(12) {
animation-delay: -0.1s;
transform: rotate(330deg) translate(146%);
}

@keyframes spin {
0% {
opacity: 1;
}
100% {
opacity: 0.15;
}
}`,
}}
/>

                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>

);
}

``` `} />
</ViewSolution>

## Accessibility

Even if we replace our placeholder with a span we should still provide a placeholder for the textarea, this is because the placeholder attribute is used by screen readers to provide context to the user. We can hide it visually by setting the opacity to 0.

## Key takeaways

`layoutId` is very powerful, and it's even more powerful once you become a bit creative with it. In this case, we created an illusion. The placeholder is not an actual placeholder, but it looks like one.

Another good takeaway here is that the `popLayout` mode is often times the right mode for your animations. If you see your exit animation breaking, think about the `mode` prop.
