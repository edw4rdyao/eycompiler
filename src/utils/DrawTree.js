/**
 * @file: Tree.js
 * @ref: https://embed.plnkr.co/pCE9Ih/
 * @author: edward yao
 * @description: draw the collapsible grammar tree by d3.js
 */

import d3 from "d3";

export default function drawGrammarTree(grammarTreeData, containerId, treeSvgId) {
  // if(document.getElementById(treeSvgId)) return ;
  // Misc. variables
  var i = 0;
  var duration = 700;
  var root;
  var viewerWidth = 760, viewerHeight = 480;
  var tree = d3.layout.tree(grammarTreeData)
    .size([viewerWidth, viewerHeight]);
  // define a d3 diagonal projection for use by the node paths later on.
  var diagonal = d3.svg.diagonal()
    .projection(function (d) {
      return [d.x, d.y];
    });
  // Define the zoom function for the zoomable tree
  function zoom() {
    svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  }
  // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
  var zoomListener = d3.behavior.zoom().scaleExtent([0.7, 1.4]).on("zoom", zoom);
  // define the baseSvg, attaching a class for styling and the zoomListener
  var baseSvg = d3.select("#" + containerId).append("svg")
    .attr("id", treeSvgId)
    .attr("class", "overlay")
    .call(zoomListener);
  // Helper functions for collapsing and expanding nodes.
  function collapse(d) {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(collapse)
      d.children = null;
    }
  }
  // Function to center node when clicked so node doesn't get lost when collapsing/moving with large amount of children.
  function centerNode(source) {
    var scale = zoomListener.scale();
    var x = -source.x0;
    var y = -source.y0;
    var x = x * scale + viewerWidth / 2;
    var y = y * scale + viewerHeight / 2;
    d3.select('g').transition()
      .duration(duration)
      .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
    zoomListener.scale(scale);
    zoomListener.translate([x, y]);
  }
  // Toggle children function
  function toggleChildren(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else if (d._children) {
      d.children = d._children;
      d._children = null;
    }
    return d;
  }
  // Toggle children on click.
  function click(d) {
    if (d3.event.defaultPrevented) return; // click suppressed
    d = toggleChildren(d);
    update(d);
    centerNode(d);
  }
  var toolTips = document.getElementById("tooltips");
  // mouse over to display tooltips
  function mouseOver(d) {
    toolTips.style.visibility = "visible";
    var t = "";
    if (!d._children && !d.children) {
      t += "Type: Terminal"
    }
    else {
      t += "Type: Nonterminal";
    }
    t += `<br>Value: "${d.name}"`;
    toolTips.innerHTML = t;
    toolTips.style.top = `${d3.event.pageY - 20}px`;
    toolTips.style.left = `${d3.event.pageX + 20}px`;
  }
  function mouseOut(d) {
    toolTips.style.visibility = "hidden";
  }
  function update(source) {
    // Compute the new height, function counts total children of root node and sets tree height accordingly.
    // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
    // This makes the layout more consistent.
    var levelWidth = [1];
    var childCount = function (level, n) {
      if (n.children && n.children.length > 0) {
        if (levelWidth.length <= level + 1) levelWidth.push(0);

        levelWidth[level + 1] += n.children.length;
        n.children.forEach(function (d) {
          childCount(level + 1, d);
        });
      }
    };
    childCount(0, root);
    var newWidth = d3.max(levelWidth) * 75;
    tree = tree.size([newWidth, viewerHeight]);
    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse(),
      links = tree.links(nodes);
    // Set widths between levels based on maxLabelLength.
    nodes.forEach(function (d) {
      // alternatively to keep a fixed scale one can set a fixed depth per level
      // Normalize for fixed-depth by commenting out below line
      d.y = (d.depth * 100);
    });
    // Update the nodes…
    var node = svgGroup.selectAll("g.node")
      .data(nodes, function (d) {
        return d.id || (d.id = ++i);
      });
    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function (d) {
        return "translate(" + source.x0 + "," + source.y0 + ")";
      })
      .on('click', click);
    nodeEnter.append("circle")
      .attr('class', 'nodeCircle')
      .attr("r", 0)
      .style("fill", function (d) {
        return (d._children || d.children) ? "lightsteelblue" : "#fff";
      })
      .on("mouseover", mouseOver)
      .on("mouseout", mouseOut);
    // Change the circle fill depending on whether it has children and is collapsed
    node.select("circle.nodeCircle")
      .attr("r", 8)
      .style("fill", function (d) {
        return (d._children || d.children) ? "lightsteelblue" : "#fff";
      });
    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
      });
    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function (d) {
        return "translate(" + source.x + "," + source.y + ")";
      })
      .remove();
    nodeExit.select("circle")
      .attr("r", 0);
    // Update the links…
    var link = svgGroup.selectAll("path.link")
      .data(links, function (d) {
        return d.target.id;
      });
    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
      .attr("class", "link")
      .attr("d", function (d) {
        var o = {
          x: source.x0,
          y: source.y0
        };
        return diagonal({
          source: o,
          target: o
        });
      });
    // Transition links to their new position.
    link.transition()
      .duration(duration)
      .attr("d", diagonal);
    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
      .duration(duration)
      .attr("d", function (d) {
        var o = {
          x: source.x,
          y: source.y
        };
        return diagonal({
          source: o,
          target: o
        });
      })
      .remove();

    // Stash the old positions for transition.
    nodes.forEach(function (d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }
  // Append a group which holds all nodes and which the zoom Listener can act upon.
  var svgGroup = baseSvg.append("g");
  // Define the root
  root = grammarTreeData;
  root.x0 = viewerWidth / 2;
  root.y0 = 0;
  // Layout the tree initially and center on the root node.
  collapse(root);
  update(root);
  centerNode(root);
}