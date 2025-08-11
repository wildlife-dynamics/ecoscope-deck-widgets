import {
  Deck,
  Widget,
  WidgetPlacement,
} from '@deck.gl/core';

export type LegendWidgetProps = {
  id: string;
  title: string;
  legend: Map<string, string>;
  placement?: WidgetPlacement;
  style?: Partial<CSSStyleDeclaration>;
  className?: string;
}

export default class LegendWidget implements Widget<LegendWidgetProps> {
  id = 'legend';
  props: LegendWidgetProps;
  placement: WidgetPlacement = 'bottom-right';
  deck?: Deck;
  element?: HTMLDivElement;

  constructor(props: LegendWidgetProps) {
    this.id = props.id ?? 'legend';
    this.placement = props.placement ?? 'bottom-right';
    this.props = {...props};
    this.props.style = this.props.style ?? {};
    this.props.title = this.props.title ?? 'Legend';
  }

  setProps(props: Partial<LegendWidgetProps>) {
    Object.assign(this.props, props);
  }

  onAdd({ deck }: { deck: Deck }): HTMLDivElement {
    const element = document.createElement('div');
    element.classList.add('deck-widget');
    const {className} = this.props; 
    if (className) element.classList.add(className);

    const titleElement = document.createElement('div');
    titleElement.innerText = this.props.title;
    titleElement.classList.add('legend-title');

    const legendElement = document.createElement('div');
    legendElement.classList.add('legend-scale');

    const ul = document.createElement('ul');
    ul.classList.add('legend-labels');

    this.props.legend.forEach((color, label) => {
      const li = document.createElement('li');
      const span = document.createElement('span');

      span.style.setProperty('background', color);
      li.innerText = label;

      li.appendChild(span);
      ul.appendChild(li);
    });

    legendElement.appendChild(ul);

    const { style } = this.props;
    if (style) {
      Object.entries(style).map(([key, value]) => {
        element.style.setProperty(key, value as string);
      });
    }
    element.appendChild(titleElement);
    element.appendChild(legendElement);

    this.deck = deck;
    this.element = element;
    return element;
  }

  onRemove() {
    this.deck = undefined;
    this.element = undefined;
  }
}