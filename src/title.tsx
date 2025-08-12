import {
  Deck,
  Widget,
  WidgetPlacement,
} from '@deck.gl/core';
import './style.css'

export type TitleWidgetProps = {
  id: string;
  title: string;
  placement?: WidgetPlacement;
  style?: Partial<CSSStyleDeclaration>;
  className?: string;
  placementX?: string;
  placementY?: string;
}

export default class TitleWidget implements Widget<TitleWidgetProps> {
  id = 'title';
  props: TitleWidgetProps;
  placement: WidgetPlacement = 'fill';
  deck?: Deck;
  element?: HTMLDivElement;

  constructor(props: TitleWidgetProps) {
    this.id = props.id ?? 'title';
    this.placement = props.placement ?? 'fill';
    this.props = {
      className: "deck-widget-title",
      ...props
    };
    this.props.style = {
      position: "absolute",
      transform: "translate(-50%, -50%)",
      left: "50%",
      top: "1%",
      ...props.style ?? {},
    };
  }

  setProps(props: Partial<TitleWidgetProps>) {
    Object.assign(this.props, props);
  }

  onAdd({ deck }: { deck: Deck }): HTMLDivElement {
    const element = document.createElement('div');

    element.classList.add('deck-widget');
    const {className} = this.props;   
    if (className) element.classList.add(className);

    const titleElement = document.createElement('div');
    titleElement.innerText = this.props.title;

    const { style } = this.props;
    if (style) {
      Object.entries(style).map(([key, value]) => {
        element.style.setProperty(key, value as string);
      });
    }
    element.appendChild(titleElement);

    this.deck = deck;
    this.element = element;
    return element;
  }

  onRemove() {
    this.deck = undefined;
    this.element = undefined;
  }
}