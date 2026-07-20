
export const COLORS = {
  red: '#E2445C',
  orange: '#FDAB3D',
  yellow: '#F8C500',
  green: '#2ED47A',
  blue: '#579BFC',
  indigo: '#7E3B8A',
  violet: '#A25DDC',
}

export const COLOR_SCHEMES = {
    red: ["#E2445C", "#D41A37", "#F795A4", "#A8147F", "#DC84C4", "#B33690", "#AB4A0D", "#E0671B", "#FFC099", "#C656A7"],
    orange: [ "#FDAB3D", "#B56905", "#FFCD8B", "#EEB60C", "#FFE28B", "#B58905", "#B53705", "#B58905", "#FFD761", "#FF8E61" ],
    yellow: [ "#F8C500", "#DFB407", "#C6A30E", "#AE9115", "#95801C", "#7C6F22", "#635E29", "#4B4C30", "#323B37", "#192A3E" ],
    green: [ "#2ED47A", "#2CC173", "#29AE6D", "#279B66", "#25885F", "#227659", "#206352", "#1E504B",  "#1B3D45", "#192A3E" ],
    blue: ["#579BFC", "#508EE7", "#4982D2", "#4275BD", "#3B69A8", "#355C92", "#2E507D", "#274368", "#203753", "#192A3E" ],
    indigo: [ "#7E3B8A", "#733982", "#683779", "#5C3571", "#513368", "#463260", "#3B3057", "#2F2E4F", "#242C46", "#192A3E" ],
    violet: [ "#A25DDC", "#9357CA", "#8452B9", "#744CA7", "#654696", "#564184", "#473B73", "#373561", "#283050", "#192A3E" ],
    rainbow: [ "#E2445C", "#A25DDC", "#6734BC", "#7E3B8A", "#579BFC", "#02A7F8", "#01BAD7", "#019588", "#2ED47A", "#89C541", "#CCDE1D", "#F8C500", "#FFC301"],

    // Sequential yellow -> orange -> red heat scale (ColorBrewer YlOrRd).
    // Ordered light-to-dark so low counts read pale and high counts read hot,
    // which is the direction people expect from a heatmap. Perceptually
    // ordered, so it survives greyscale printing and most color vision
    // deficiencies — unlike the rainbow scheme, where hue carries the meaning.
    heat: [ "#FFFFCC", "#FFEDA0", "#FED976", "#FEB24C", "#FD8D3C", "#FC4E2A", "#E31A1C", "#BD0026", "#800026" ],
}
