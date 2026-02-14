import { getPageImage, source } from "@/lib/source";
import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";

// Logo paths
const leftCubbyPath =
  "m147.19,89.78a0.43,0.43 0 0 1 -0.65,0.37q-14.33,-8.4 -22.08,-13.59q-6.46,-4.32 -10.41,-5.08q-8.76,-1.68 -16.33,3.03q-20.02,12.45 -26.69,16.28q-7.52,4.32 -9.49,11.18q-0.74,2.58 -0.69,14.88q0.1,27.43 0.11,29.51q0.05,7.62 4.6,13.74q1.72,2.32 11.22,7.87q6.51,3.8 20.62,13.36q8.31,5.63 18.66,3.01q2.79,-0.71 9.2,-4.81q9.98,-6.38 17.89,-11.6c7.83,-5.17 14.43,-2.39 22.28,3.01q3.42,2.36 44.02,28.4a0.63,0.62 45.6 0 1 -0.01,1.06q-23.55,14.55 -75.18,46.15q-8.68,5.31 -14.07,6.82q-16.23,4.54 -30.73,-4.48q-64.66,-40.24 -67.2,-41.79q-8.36,-5.12 -11.28,-8.09c-6.43,-6.53 -9.97,-14.91 -10.88,-23.94q-0.1,-0.99 -0.1,-12.87q0,-71.48 0.12,-81.25q0.21,-15.83 9.92,-26.28q3.25,-3.49 16.03,-10.89q35.15,-20.32 65.6,-38.81c7.83,-4.74 18.85,-6.19 27.77,-3.91q3.67,0.94 10.2,4.79q8.94,5.27 16.58,10.78a2.35,2.34 -72.2 0 1 0.97,1.9l0,71.25z";

const rightCubbyPath =
  "m222.62,127.27q1.64,1.9 -0.03,0.24a0.15,0.15 0 0 1 0.18,-0.24q6.04,3.63 15.31,9.78c7.81,5.18 12.95,7.2 21.13,5.01q3.2,-0.86 8.85,-4.65q5.52,-3.7 11.51,-7.17q7.44,-4.3 9.57,-7.41q3.84,-5.59 3.86,-11.45q0.11,-40.11 0.56,-63.5q0.12,-5.92 0.45,-8.77c0.91,-8.08 5.65,-13.17 12.52,-17.06q23.02,-13.06 27.8,-15.91c5.09,-3.03 9.6,-4.45 14.55,-1.86c4.29,2.25 5.26,5.68 5.27,10.79q0.15,104.17 0.18,108.69q0.11,14.14 -0.34,17.21c-1.52,10.23 -6.18,20.67 -15.39,26.13q-30,17.78 -43.77,26.25q-19.42,11.95 -22.76,13.72c-12.98,6.89 -26.18,6 -38.05,-2.08q-1.39,-0.94 -11.46,-7.18a1.81,1.78 16.2 0 1 -0.85,-1.52l0,-68.68a0.52,0.52 0 0 1 0.91,-0.34z";

const centerCubbyPath =
  "m154.49,23.48a0.34,0.34 0 0 1 0.5,-0.25q8.92,4.96 19.32,11.88c11.38,7.59 15.6,9.96 27.71,17.35c6.23,3.81 11.74,8.9 12.5,16.69q0.67,6.76 0.58,15.48q-0.48,50.4 -0.23,107.33a0.34,0.34 0 0 1 -0.52,0.29q-38.91,-24.59 -43.58,-27.54c-10.24,-6.46 -16.18,-16.24 -16.27,-28.57c-0.25,-39.27 0.15,-69.33 -0.09,-110.76q-0.01,-1.14 0.08,-1.9z";

interface RouteContext {
  params: Promise<{ slug: string[] }>;
}

export async function GET(_req: Request, { params }: RouteContext) {
  const { slug } = await params;
  // Remove the last segment (image.png) to get the actual page slug
  const page = source.getPage(slug.slice(0, -1));
  if (!page) notFound();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#09090b",
          overflow: "hidden",
        }}
      >
        {/* Large decorative logo - right side */}
        <svg
          width="480"
          height="345"
          viewBox="0 0 354 255"
          style={{
            position: "absolute",
            top: "50%",
            right: -80,
            transform: "translateY(-50%)",
            opacity: 0.07,
          }}
        >
          <path d={leftCubbyPath} fill="white" />
          <path d={centerCubbyPath} fill="white" />
          <path d={rightCubbyPath} fill="white" />
        </svg>

        {/* Content container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "80px 100px",
            height: "100%",
            maxWidth: "75%",
          }}
        >
          {/* Small logo mark */}
          <svg
            width="48"
            height="34"
            viewBox="0 0 354 255"
            style={{ marginBottom: 32 }}
          >
            <path d={leftCubbyPath} fill="white" />
            <path d={centerCubbyPath} fill="white" />
            <path d={rightCubbyPath} fill="white" />
          </svg>

          {/* Page title */}
          <div
            style={{
              fontSize: 64,
              fontWeight: 600,
              color: "white",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              marginBottom: 20,
            }}
          >
            {page.data.title}
          </div>

          {/* Description */}
          {page.data.description && (
            <div
              style={{
                fontSize: 24,
                color: "rgba(255, 255, 255, 0.5)",
                lineHeight: 1.4,
                maxWidth: 600,
              }}
            >
              {page.data.description}
            </div>
          )}

          {/* Site badge */}
          <div
            style={{
              display: "flex",
              marginTop: 40,
            }}
          >
            <div
              style={{
                fontSize: 16,
                color: "rgba(255, 255, 255, 0.35)",
                background: "rgba(255, 255, 255, 0.05)",
                padding: "8px 16px",
                borderRadius: 6,
                letterSpacing: "0.02em",
              }}
            >
              cubby-ui.dev
            </div>
          </div>
        </div>

        {/* Vertical accent line */}
        <div
          style={{
            position: "absolute",
            left: 60,
            top: 80,
            bottom: 80,
            width: 3,
            background:
              "linear-gradient(180deg, transparent, rgba(255,255,255,0.15), transparent)",
            borderRadius: 2,
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

export const dynamicParams = false;

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    slug: getPageImage(page).segments,
  }));
}
