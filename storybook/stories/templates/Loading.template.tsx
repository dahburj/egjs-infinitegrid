import * as React from "react";
import { previewTemplate, previewFunction, codeIndent, CODE_TYPE, convertGlobalCSS } from "storybook-addon-preview";
import { VANILLA_MARKUP_TEMPLATE, REACT_MARKUP_TEMPLATE, ANGULAR_MARKUP_TEMPLATE, VUE_MARKUP_TEMPLATE, SVELTE_MARKUP_TEMPLATE, SVELTE_SQUARE_MARKUP_TEMPLATE, VUE_SQUARE_MARKUP_TEMPLATE, ANGULAR_SQUARE_MARKUP_TEMPLATE, REACT_SQUARE_MARKUP_TEMPLATE, VANILLA_SQUARE_MARKUP_TEMPLATE } from "./markup.template";
import { GET_ITEMS_TEMPLATE } from "./default.template";

const Item = ({ num }) => <div className="item" data-column={num % 4 === 1 ? 2 : 1}>
    <div className="thumbnail">
        <img
            src={`https://naver.github.io/egjs-infinitegrid/assets/image/${(num % 29) +
                1}.jpg`}
            alt="egjs"
        />
    </div>
    <div className="info">{`egjs ${num}`}</div>
</div>;
function getItems(nextGroupKey, nextKey, count) {
    const nextItems: Array<{ groupKey: number, key: number }> = [];

    for (let i = 0; i < count; ++i) {
        nextItems.push({ groupKey: nextGroupKey, key: nextKey + i });
    }
    return nextItems;
}

export default function Loading({
    storyName,
    title,
    itemCount,
    LayoutType,
    className,
    options,
    layoutOptions,
    useFirstRender,
    loading,
    dataDelay,
}) {
    const [items, setItems] = React.useState(getItems(0, 0, itemCount));
    return <div className="app">
    <h1 className="header">
        <a href="https://github.com/naver/egjs-infinitegrid" target="_blank">{storyName} - {title}</a>
    </h1>
    <LayoutType
        useFirstRender={useFirstRender}
        className={className}
        groupBy={item => item.props["data-groupkey"]}
        options={options}
        layoutOptions={layoutOptions}
        loading={<div className="loading"><span>Loading...</span></div>}
        onAppend={e => {
            const nextGroupKey = (+e.groupKey! || 0) + 1;
            const nextKey = items.length;

            e.startLoading();
            setTimeout(() => {
                setItems([
                    ...items,
                    ...getItems(nextGroupKey, nextKey, itemCount),
                ]);
            }, dataDelay);
        }}
        onLayoutComplete={e => {
            !e.isLayout && e.endLoading();
        }}
    >
        {items.map(item => <Item data-groupkey={item.groupKey} key={item.key} num={item.key} />)}
    </LayoutType>
    </div>;
}

const ON_APPEND_TEMPLATE = previewFunction(`function onAppend(e) {
    if (e.currentTarget.isProcessing()) {
        return;
    }
    const nextGroupKey = (typeof e.groupKey === "undefined" ? 0 : +e.groupKey || 0) + 1;
    const nextKey = this.items.length;

    e.startLoading();
    setTimeout(() => {
        //-react this.items = [
        //-react     ...this.items,
        //-react     ...getItems(nextGroupKey, nextKey, itemCount),
        //-react ];
        //react setItems([
        //react     ...this.items,
        //react     ...getItems(nextGroupKey, nextKey, itemCount),
        //react ]);
    }, dataDelay);
}`);
const ON_LAYOUT_COMPLETE_TEMPLATE = previewFunction(`function onLayoutComplete(e) {
    !e.isLayout && e.endLoading();
}`);
export const LOADING_HTML_TEMPLATE = ({ storyName, title, layoutType }) => `
<h1 class="header">
    <a href="https://github.com/naver/egjs-infinitegrid" target="_blank">${storyName} - ${title}</a>
</h1>
<div class="container ${layoutType}">
</div>
`;

export const LOADING_VANILLA_TEMPLATE = ({ layoutType, layoutOptions }) => {
    return previewTemplate`
import InfiniteGrid, { ${layoutType} } from "@egjs/infinitegrid";
const itemCount = ${"itemCount"};
const dataDelay = ${"dataDelay"};

function getItems(nextGroupKey, count) {
    const nextItems = [];

    for (let i = 0; i < count; ++i) {
        const num = nextGroupKey * count + i;
        nextItems.push(${"`"}${layoutType === "SquareLayout" ? VANILLA_SQUARE_MARKUP_TEMPLATE : VANILLA_MARKUP_TEMPLATE}${"`"});
    }
    return nextItems.join("");
}
const ig = new InfiniteGrid(".container", {
    isOverflowScroll: ${"isOverflowScroll"},
    useRecycle: ${"useRecycle"},
    horizontal: ${"horizontal"},
    useFit: ${"useFit"},
});

ig.setLayout(${layoutType}, ${previewTemplate.object(layoutOptions, {
        indent: 4,
    })});

ig.on("append", e => {
    if (ig.isProcessing()) {
        return;
    }
    const nextGroupKey = (+e.groupKey! || 0) + 1;

    e.startLoading();
    ig.append(getItems(nextGroupKey, itemCount), nextGroupKey);
}).on("layoutComplete", ${ON_LAYOUT_COMPLETE_TEMPLATE(CODE_TYPE.ARROW)});

ig.setLoadingBar(${"`"}<div class="loading">Loading...</div>${"`"});
ig.layout();
    `;
};

export const LOADING_REACT_TEMPLATE = ({ storyName, title, layoutType, layoutOptions }) => {
    return previewTemplate`
import * as React from "react";
import { ${layoutType} } from "@egjs/react-infinitegrid";

const itemCount = ${"itemCount"};
const dataDelay= ${"dataDelay"};
const Item = ({ num }) => ${layoutType === "SquareLayout" ? REACT_SQUARE_MARKUP_TEMPLATE : REACT_MARKUP_TEMPLATE};

${GET_ITEMS_TEMPLATE}

export default function App() {
    const [items, setItems] = React.useState(getItems(0, 0, itemCount));

    return <div className="app">
        <h1 className="header">
            <a href="https://github.com/naver/egjs-infinitegrid" target="_blank">${storyName} - ${title}</a>
        </h1>
        <${layoutType}
            className="${layoutType.toLowerCase()} container"
            loading={<div className="loading">Loading...</div>}
            groupBy={item => item.props["data-groupkey"]}
            options={{
                isOverflowScroll: ${"isOverflowScroll"},
                useRecycle: ${"useRecycle"},
                horizontal: ${"horizontal"},
                useFit: ${"useFit"},
            }}
            layoutOptions={${previewTemplate.object(layoutOptions, {
                indent: 16,
            })}}
            onAppend={${codeIndent(ON_APPEND_TEMPLATE(CODE_TYPE.ARROW, "react"), { indent: 12 })}}
            onLayoutComplete={${codeIndent(ON_LAYOUT_COMPLETE_TEMPLATE(CODE_TYPE.ARROW), { indent: 12 })}}
        >
            {items.map(item => <Item data-groupkey={item.groupKey} key={item.key} num={item.key} />)}
        </${layoutType}>
    </div>;
}
    `;
};

export const LOADING_ANGULAR_TEMPLATE = ({ layoutOptions }) => {
    return previewTemplate`
import { Component } from "@angular/core";

const itemCount = ${"itemCount"};
const dataDelay = ${"dataDelay"};

${GET_ITEMS_TEMPLATE}

@Component({
    selector: 'app-root',
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.css"]
})
export class AppComponent {
    items = getItems(0, 0, ${"itemCount"});
    options = {
        isOverflowScroll: ${"isOverflowScroll"},
        useRecycle: ${"useRecycle"},
        horizontal: ${"horizontal"},
        useFit: ${"useFit"},
    };
    layoutOptions = ${previewTemplate.object(layoutOptions, {
        indent: 8,
    })};
    groupBy(index, item) {
        return item.groupKey;
    }
    trackBy(index, item) {
        return item.key;
    }
    ${codeIndent(ON_APPEND_TEMPLATE(CODE_TYPE.METHOD), { indent: 4 })}
    ${codeIndent(ON_LAYOUT_COMPLETE_TEMPLATE(CODE_TYPE.METHOD), { indent: 4 })}
}`;
};
export const LOADING_ANGULAR_HTML_TEMPLATE = ({ storyName, title, layoutType }) => {
    return previewTemplate`
<h1 class="header">
    <a href="https://github.com/naver/egjs-infinitegrid" target="_blank">${storyName} - ${title}</a>
</h1>
<div
    class="container ${layoutType.toLowerCase()}"
    Ngx${layoutType}
    [options]="options"
    [layoutOptions]="layoutOptions"
    [items]="items"
    [trackBy]="trackBy"
    [groupBy]="groupBy"
    [loading]="loading"
    (append)="onAppend($event)"
    (layoutComplete)="onLayoutComplete($event)"
    #ig
>
    ${codeIndent(layoutType === "SquareLayout" ? ANGULAR_SQUARE_MARKUP_TEMPLATE : ANGULAR_MARKUP_TEMPLATE, { indent: 4 })}
    <div class="loading" #loading>Loading...</div>
</div>
`;
};

export const LOADING_VUE_TEMPLATE = ({ storyName, title, layoutType, layoutOptions, cssTemplate }) => {
    return previewTemplate`
<template>
    <div class="app">
        <h1 class="header">
            <a href="https://github.com/naver/egjs-infinitegrid" target="_blank">${storyName} - ${title}</a>
        </h1>
        <${layoutType}
            class="container ${layoutType.toLowerCase()}"
            :options="options"
            :layoutOptions="layoutOptions"
            @append="onAppend"
            @layout-complete="onLayoutComplete"
        >
            ${codeIndent(layoutType === "SquareLayout" ? VUE_SQUARE_MARKUP_TEMPLATE : VUE_MARKUP_TEMPLATE, { indent: 12 })}
            <div class="loading" slot="loading">Loading...</div>
        </${layoutType}>
    </div>
</template>
<script>
    import { ${layoutType} } from "@egjs/vue-infinitegrid";

    const itemCount = ${"itemCount"};
    const dataDelay = ${"dataDelay"};
    ${codeIndent(GET_ITEMS_TEMPLATE, { indent: 4 })}

    export default {
        components: {
            ${layoutType},
        },
        data() {
            return {
                items: getItems(0, 0, itemCount),
                options: {
                    isOverflowScroll: ${"isOverflowScroll"},
                    useRecycle: ${"useRecycle"},
                    horizontal: ${"horizontal"},
                    useFit: ${"useFit"},
                },
                layoutOptions: ${previewTemplate.object(layoutOptions, { indent: 20 })},
            };
        },
        methods: {
            ${codeIndent(ON_APPEND_TEMPLATE(CODE_TYPE.METHOD), { indent: 12 })},
            ${codeIndent(ON_LAYOUT_COMPLETE_TEMPLATE(CODE_TYPE.METHOD), { indent: 12 })}
        },
    };
</script>
<style scoped>
    ${codeIndent(cssTemplate, { indent: 4 })}
</style>
`;
};

export const LOADING_SVELTE_SCRIPT_TEMPLATE = ({ layoutType, cssTemplate }) => {
    return previewTemplate`
<script>
    import { ${layoutType} } from "@egjs/svelte-infinitegrid";

    const itemCount = ${"itemCount"};
    const dataDelay = ${"dataDelay"};
    let items = getItems(0, 0, itemCount);
    ${codeIndent(GET_ITEMS_TEMPLATE, { indent: 4 })}
</script>
<style>
    ${codeIndent(convertGlobalCSS(cssTemplate, [`.${layoutType.toLowerCase()}`, ".container"]), { indent: 4 })}
</style>`;
};

export const LOADING_SVELTE_JSX_TEMPLATE = ({ storyName, title, layoutType, layoutOptions }) => previewTemplate`
<h1 class="header">
    <a href="https://github.com/naver/egjs-infinitegrid" target="_blank">${storyName} - ${title}</a>
</h1>
<${layoutType}
    class="container ${layoutType.toLowerCase()}"
    items={items}
    itemBy={item => item.key}
    groupBy={item => item.groupKey}
    status={null}
    options={{
        isOverflowScroll: ${"isOverflowScroll"},
        useRecycle: ${"useRecycle"},
        horizontal: ${"horizontal"},
        useFit: ${"useFit"},
    }}
    layoutOptions={${previewTemplate.object(layoutOptions, {
    indent: 8,
})}}
    on:append={${codeIndent(ON_APPEND_TEMPLATE(CODE_TYPE.CUSTOM_EVENT_ARROW), { indent: 4 })}}
    on:layoutComplete={${codeIndent(ON_LAYOUT_COMPLETE_TEMPLATE(CODE_TYPE.CUSTOM_EVENT_ARROW), { indent: 4 })}}
    let:visibleItems>
    {#each visibleItems as item (item.key)}
        ${codeIndent(layoutType === "SquareLayout" ? SVELTE_SQUARE_MARKUP_TEMPLATE : SVELTE_MARKUP_TEMPLATE, { indent: 8 })}
    {/each}
    <div class="loading" slot="loading">Loading...</div>
</${layoutType}>`;
