import {
  Deck,
  Viewport,
  WebMercatorViewport,
  Widget,
  WidgetPlacement,
} from "@deck.gl/core";
import {render} from 'preact';

export type ScaleWidgetProps = {
  id?: string;
  style?: Partial<CSSStyleDeclaration>;
  className?: string;
  placement?: WidgetPlacement;
  viewId?: string | null;
  maxWidth?: number;
  useImperial?: boolean;
}

export default class ScaleWidget implements Widget<ScaleWidgetProps> {
  id = "scale";
  props: ScaleWidgetProps;
  placement: WidgetPlacement = "bottom-left";
  viewId?: string | null = null;
  viewport?: Viewport;
  deck?: Deck;
  element?: HTMLDivElement;

  constructor(props: ScaleWidgetProps) {
    this.id = props.id ?? "scale";
    this.placement = props.placement ?? "bottom-left";
    this.viewId = props.viewId ?? null;
    props.maxWidth = props.maxWidth ?? 300;
    props.useImperial = props.useImperial ?? false;
    props.style = props.style ?? {};
    this.props = {...props};
  }

  setProps(props: Partial<ScaleWidgetProps>) {
    Object.assign(this.props, props);
  }

  onViewportChange(viewport: Viewport) {
    this.viewport = viewport;
    this.update();
  }

  onAdd({ deck }: { deck: Deck<any> }): HTMLDivElement {
    const { style, className } = this.props;
    const element = document.createElement("div");
    element.classList.add("deck-widget", "deck-widget-scale");
    if (className) element.classList.add(className);
    if (style) {
      Object.entries(style).map(([key, value]) =>
        element.style.setProperty(key, value as string),
      );
    }
    this.deck = deck;
    this.element = element;

    this.update();
    return element;
  }

  update() {
    if (this.viewport instanceof WebMercatorViewport) {
      const meters = this.viewport.metersPerPixel * this.props.maxWidth;
      let distance: number
      let label: string;

      if (this.props.useImperial) {
        const feet = meters * 3.2808399;
        if (feet > 5280) {
          distance = feet / 5280;
          label = "mi";
        } else {
          distance = feet;
          label = "ft";
        }
      } else {
        distance = meters < 1000 ? meters : meters / 1000;
        label = meters < 1000 ? "m" : "km";
      }

      const ratio = this.roundNumber(distance) / distance;
      distance = this.roundNumber(distance);
      const width = `${Math.round(this.props.maxWidth * ratio * (4 / 3))}px`;

      const element = this.element;
      if (!element) {
        return;
      }
      const ui = (
        <div>
          <svg id="test" style={{ width: width, height: "40px" }}>
            <rect
              id="border"
              style={{ stroke: "#000", fill: "#FFF" }}
              height="40%"
              width="75%"
              x="5%"
              y="2%"
            />
            <rect
              id="first_block"
              style={{ fill: "#000" }}
              height="20%"
              width="37.5%"
              x="5%"
              y="2%"
            />
            <rect
              id="second_block"
              style={{ fill: "#000" }}
              height="20%"
              width="37.5%"
              x="42.5%"
              y="22%"
            />
            <text id="zero" textAnchor="middle" fontSize="20" x="5%" y="95%">
              0
            </text>
            <text
              id="half_scale"
              fontSize="20"
              textAnchor="middle"
              x="42.5%"
              y="95%"
            >
              {distance / 2}
            </text>
            <text id="scale" fontSize="20" textAnchor="middle" x="80%" y="95%">
              {distance}
            </text>
            <text id="unit" fontSize="20" x="82%" y="42%">
              {label}
            </text>
          </svg>
        </div>
      );

      render(ui, element);
    }
  }

  roundNumber(number: number) {
    const pow10 = Math.pow(10, `${Math.floor(number)}`.length - 1);
    let d = number / pow10;

    d = d >= 10 ? 10 : d >= 5 ? 5 : d >= 3 ? 3 : d >= 2 ? 2 : 1;

    return pow10 * d;
  }

  onRemove() {
    this.deck = undefined;
    this.element = undefined;
  }
}
