# Fitflex
Have you still been scratching your head about how to realize vertical-center alignment of DOM element?
Don't worry, buddies. Fitflex provides you a comfortable method to realize responsive layout only by a few Javascript codes and configuration. One more thing, it can be adapted to all kinds of screen size of mobiles, pads, desktops… 
Are you thrilled about it? Let’s just play with it right now!

# Usage in browser
### Script Tag

```js
  <script src="fitflex.mini.js"></script>
```
Then let's configure options to adjust elements.

```js
<body>
    <div id='box'>
        <div class='child'>child1</div>
        <div class='child'>child2</div>
        <div class='child'>child3</div>
    </div>
    <script src="fitflex.mini.js"></script>
    <script>
        var option = {
          location:'vertical',
          center:'cross'
        }
        fit('#box').flex(option);
    </script>
</body>
```
Check your browser. see, vertical center!

### Container
The container is the parentNode in which childNodes is placed by **fitflex**. 
It has the similar usage as jquery `$("p").add("div")`.

Here it is.

```js
fit(container).flex(option)
```


### Options

```js
 var option = {
            children: "",
            location: "",
            center: "",
            adjust: "",
            gapRatio: {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                outerAll: 0,
                innerWidth: 0,
                innerHeight: 0
            },
            screenWidth: { min: 0, max: Infinity },
            flexWhenResize: true
        };
```

| Key             | Type           | Value                                                                                                       |
| --------------- | -------------- | ----------------------------------------------------------------------------------------------------------- |
| **children**    | String \|Array | selected childNodes                                                                                         |
| **location**    | String         | `horizontal`, `vertical`                                                                                    |
| **center**      | String         | `forward`, `cross`, `bothway`                                                                               |
| **adjust**      | String         | three strings combination: `oneline`\|`multiline` + `outerfit`\|`innerfit` + `forward`\|`cross`\|`bothway`. |
| **gapRatio**    | Object         | keys: `left`, `right`, `top`, `bottom`, `outerall`, `innerWidth`, `innerHeight`                             |
| **screenWidth** | Object         | min: `numbers`, max: `numbers`                                                                              |

### Introduction to options

**children**
The selected childNodes involved into layout placement. By default, all childNodes will be involved.  The value could be element ID or className, such as `.child`, `#child `, or array of them, `[.child1, .child2, .child3] `. If you want to specify childNodes width and height, then `[{d:.child1, w:0.1, height: 0.2}, {d:.child2, w:0.2, height: 0.1}]`. You even can use 2D array so that you can group childNodes into different rows, such as `[[{d:.child1, w:0.1, height: 0.2}], [{d:.child2, w:0.2, height: 0.1}]]`. pls note that `w` and `h` value is not `px`, it is the ratio of childNodes dimension to parentNode dimension. 

**location**
`horizontal`(default) and `vertical`. 

**center**
`forward`: childNodes centered in X-Axis; `cross`: centered in Y-Axis; `bothway`: centered in both X and Y Axis.

**adjust**
This option is used to adjust the fitting of childNodes bundaries and parentNodes bundaries so that you can make childNodes and parentNodes dimension fit each other automatically. Value setting is based on 3 strings combination, such as: `onelineOuterfitForward` or `multilineInnerfitCross`, case insensitive.  
`oneline`: force selected childNodes into one line. 
`multiline`: childNodes placement is based on previous options setting.
`outerfit`:adjust parentNodes bundaries to fit childNodes dimension.  
`innerfit`:adjust childNodes bundaries to fit parentNodes dimension. 
`forward`: fit in X-Axis. 
`cross`: fit in Y-Axis.
`bothway`：fit in both X and Y Axis.

**gapRatio**
The gap distance between childNodes and parentNodes (`left`, `right`, `top`, `bottom`, `outerall`), or among childNodes (`innerWidth`, `innerHeight`). pls note that value is not `px`, it is the ratio of childNodes dimension to parentNode dimension. 
You can also set one or both as below

```js
innerWidth: 'fit', innerHeight:`fit`
```
Then, the gap distance among childNode is largest so that outermost childNodes borders overlap with ParentNodes inner bundaris. 

You also can do further fine tuning for each row or column gap distance among ChildNodes by setting array value. 

```js
innerWidth: [0.05, 0.03,...], innerHeight:[0.01, 0.02,...]
```
pls note that array cell value is the ratio of childNodes dimension to parentNode dimension. 


**screenWidth**
fitflex is used for responsive layout, thus it is available to set the screen width range. 

**flexWhenResize**
Adjust the layout when screen width is resized. 



# Responsive Layout 
You can make different layouts adapted to different screen widths by using options array rather than one option. 

```js

<script>
        var opt1 = {
            location:'vertical',
            center:'cross',
            screenWidth: { min: 501, max: Infinity }
        }; 

        var opt2 = {
            location:'horizontal',
            center:'forward',
            screenWidth: { min: , max: 500}
        };

        var optArray = [opt1, opt2]
        fit('#box').flex(optArray);
    </script>

```






