import {
  Deck,
  Widget,
  WidgetPlacement,
} from "@deck.gl/core";
import { toPng } from "html-to-image";
import {render} from 'preact';

interface SaveImageWidgetProps {
  id?: string;
  label?: string;
  placement?: WidgetPlacement;
  style?: Partial<CSSStyleDeclaration>;
  className?: string;
}

export default class SaveImageWidget implements Widget<SaveImageWidgetProps> {
  id = "save-image";
  props: SaveImageWidgetProps;
  placement: WidgetPlacement = "top-right";
  viewId?: string | null = null;
  deck?: Deck<any>;
  element?: HTMLDivElement;

  constructor(props: SaveImageWidgetProps) {
    this.id = props.id ?? "save-image";
    this.placement = props.placement ?? "top-right";
    props.label = props.label ?? "Save as Image";
    props.style = props.style ?? {};
    this.props = {...props};
  }

  onAdd({ deck }: { deck: Deck<any> }): HTMLDivElement {
    const { style, className } = this.props;
    const element = document.createElement("div");
    element.classList.add("deck-widget", "deck-widget-save-image");
    if (className) element.classList.add(className);
    if (style) {
      Object.entries(style).map(([key, value]) =>
        element.style.setProperty(key, value as string),
      );
    }

    const ui = (
      <div className="deck-widget-button">
        <button
          className={`deck-widget-icon-button ${className}`}
          type="button"
          onClick={this.handleClick.bind(this)}
          title={this.props.label}
        >
          <svg
            fill="#000000"
            version="1.1"
            width="85%"
            height="85%"
            viewBox="0 0 492.676 492.676"
          >
            <g>
              <g>
                <path
                  d="M492.676,121.6H346.715l-23.494-74.789h-40.795H210.25h-40.794L145.961,121.6H0v324.266h492.676V121.6L492.676,121.6z
                M246.338,415.533c-72.791,0-131.799-59.009-131.799-131.799c0-72.792,59.008-131.8,131.799-131.8s131.799,59.008,131.799,131.8
                C378.137,356.525,319.129,415.533,246.338,415.533z"
                />
                <path
                  d="M246.338,199.006c-46.72,0-84.728,38.008-84.728,84.729c0,46.72,38.008,84.728,84.728,84.728
                c46.721,0,84.728-38.008,84.728-84.728C331.065,237.014,293.059,199.006,246.338,199.006z"
                />
              </g>
            </g>
          </svg>
        </button>
      </div>
    );

    this.deck = deck;
    this.element = element;
    render(ui, element);
    return element;
  }

  async handleClick() {
    if (this.deck) {
      this.deck.redraw("true");
      const deck_wrapper = this.deck?.getCanvas()?.parentElement;

      if (deck_wrapper) {
        toPng(deck_wrapper)
          .then(function (dataUrl) {
            const img = new Image();
            img.src = dataUrl;

            const a = document.createElement("a");
            a.href = dataUrl;
            a.download = "map.png";
            a.click();
          })
          .catch(function (error) {
            console.error("Failed to export PNG", error);
          });
      }
    }
  }

  onRemove() {
    this.deck = undefined;
    this.element = undefined;
  }

  setProps(props: Partial<SaveImageWidgetProps>) {
    Object.assign(this.props, props);
  }
}
