/*

 File: sigplot.annotations.js

 Copyright (c) 2012-2014, Michael Ihde, All rights reserved.
 Copyright (c) 2012-2014, Axios Inc., All rights reserved.

 This file is part of SigPlot.

 SigPlot is free software; you can redistribute it and/or modify it under the terms of the GNU Lesser
 General Public License as published by the Free Software Foundation; either version 3.0 of the License, or
 (at your option) any later version. This library is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 PURPOSE. See the GNU Lesser General Public License for more details. You should have received a copy of the
 GNU Lesser General Public License along with SigPlot.

 File: sigplot.slider.js

 Copyright (c) 2012-2014, Michael Ihde, All rights reserved.
 Copyright (c) 2012-2014, Axios Inc., All rights reserved.

 This file is part of SigPlot.

 SigPlot is free software; you can redistribute it and/or modify it under the terms of the GNU Lesser
 General Public License as published by the Free Software Foundation; either version 3.0 of the License, or
 (at your option) any later version. This library is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 PURPOSE. See the GNU Lesser General Public License for more details. You should have received a copy of the
 GNU Lesser General Public License along with SigPlot.

 File: sigplot.accordion.js

 Copyright (c) 2012-2014, Michael Ihde, All rights reserved.
 Copyright (c) 2012-2014, Axios Inc., All rights reserved.

 This file is part of SigPlot.

 SigPlot is free software; you can redistribute it and/or modify it under the terms of the GNU Lesser
 General Public License as published by the Free Software Foundation; either version 3.0 of the License, or
 (at your option) any later version. This library is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 PURPOSE. See the GNU Lesser General Public License for more details. You should have received a copy of the
 GNU Lesser General Public License along with SigPlot.

 File: sigplot.boxes.js

 Copyright (c) 2012-2014, Michael Ihde, All rights reserved.
 Copyright (c) 2012-2014, Axios Inc., All rights reserved.

 This file is part of SigPlot.

 SigPlot is free software; you can redistribute it and/or modify it under the terms of the GNU Lesser
 General Public License as published by the Free Software Foundation; either version 3.0 of the License, or
 (at your option) any later version. This library is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 PURPOSE. See the GNU Lesser General Public License for more details. You should have received a copy of the
 GNU Lesser General Public License along with SigPlot.

 File: sigplot.playback.js

 Copyright (c) 2012-2014, Michael Ihde, All rights reserved.
 Copyright (c) 2012-2014, Axios Inc., All rights reserved.

 This file is part of SigPlot.

 SigPlot is free software; you can redistribute it and/or modify it under the terms of the GNU Lesser
 General Public License as published by the Free Software Foundation; either version 3.0 of the License, or
 (at your option) any later version. This library is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 PURPOSE. See the GNU Lesser General Public License for more details. You should have received a copy of the
 GNU Lesser General Public License along with SigPlot.

 File: license.js
 Copyright (c) 2012-2014, Michael Ihde, All rights reserved.
 Copyright (c) 2012-2014, Axios Inc., All rights reserved.

 This file is part of SigPlot.

 SigPlot is free software; you can redistribute it and/or modify it under the terms of the GNU Lesser 
 General Public License as published by the Free Software Foundation; either version 3.0 of the License, or 
 (at your option) any later version. This library is distributed in the hope that it will be useful, but 
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR 
 PURPOSE. See the GNU Lesser General Public License for more details. You should have received a copy of the 
 GNU Lesser General Public License along with SigPlot.

 Portions of SigPlot may utilize the following open-source software:

   loglevel.js          - MIT License; Copyright (c) 2014, Tim Perry
   typedarray.js        - MIT License; Copyright (c) 2010, Linden Research, Inc.
   tinycolor.js         - MIT License; Copyright (c) 2013, Brian Grinstead
   CanvasInput.js       - MIT License; Copyright (c) 2013, James Simpson of GoldFire Studios
   spin.js              - MIT License; Copyright (c) 2011-2013 Felix Gnass
   Array.remove         - MIT License; Copyright (c) 2007, John Resig
   Firefox subarray fix - Public Domain; Copyright (c) 2011, Ryan Berdeen
*/
!function(t,i,o,e){t.AnnotationPlugin=function(t){this.options=t===e?{}:t,this.options.display===e&&(this.options.display=!0),this.options.textBaseline=this.options.textBaseline||"alphabetic",this.options.textAlign=this.options.textAlign||"left",this.annotations=[]},t.AnnotationPlugin.prototype={init:function(t){var o=this;this.plot=t;var s=this.plot._Mx;this.onmousemove=function(t){if(0!==o.annotations.length&&!o.options.prevent_hover)if(t.xpos<s.l||t.xpos>s.r)o.set_highlight(!1);else if(t.ypos>s.b||t.ypos<s.t)o.set_highlight(!1);else{for(var n=!1,l=0;l<o.annotations.length;l++){var h=o.annotations[l],a=e,r=e;h.absolute_placement&&(a=h.x,r=h.y),h.pxl_x!==e&&(a=h.pxl_x),h.pxl_y!==e&&(r=h.pxl_y);var p=i.real_to_pixel(s,h.x,h.y);a===e&&(a=p.x),r===e&&(r=p.y);var p=a,c=r;h.value instanceof HTMLImageElement||h.value instanceof HTMLCanvasElement||h.value instanceof HTMLVideoElement?(p-=h.width/2,c-=h.height/2):c-=h.height,i.inrect(t.xpos,t.ypos,p,c,h.width,h.height)?h.highlight||(o.set_highlight(!0,[h],a,r),n=!0):(h.highlight&&(o.set_highlight(!1,[h]),n=!0),h.selected=e)}o.plot&&n&&o.plot.refresh()}},this.plot.addListener("mmove",this.onmousemove),this.onmousedown=function(t){for(t=0;t<o.annotations.length;t++)o.annotations[t].highlight&&(o.annotations[t].selected=!0)},this.plot.addListener("mdown",this.onmousedown),this.onmouseup=function(t){for(var s=0;s<o.annotations.length;s++)o.annotations[s].selected&&(t=document.createEvent("Event"),t.initEvent("annotationclick",!0,!0),t.annotation=o.annotations[s],i.dispatchEvent(o.plot._Mx,t)&&o.annotations[s].onclick)&&o.annotations[s].onclick(),o.annotations[s].selected=e},document.addEventListener("mouseup",this.onmouseup,!1)},set_highlight:function(t,o,e,s){o=o||this.annotations;for(var n=0;n<o.length;n++){var l=document.createEvent("Event");l.initEvent("annotationhighlight",!0,!0),l.annotation=o[n],l.state=t,l.x=e,l.y=s,i.dispatchEvent(this.plot._Mx,l)&&(o[n].highlight=t)}},menu:function(){var t=function(t){return function(){t.options.display=!t.options.display,t.plot.redraw()}}(this),i=function(t){return function(){t.annotations=[],t.plot.redraw()}}(this);return{text:"Annotations...",menu:{title:"ANNOTATIONS",items:[{text:"Display",checked:this.options.display,style:"checkbox",handler:t},{text:"Clear All",handler:i}]}}},add_annotation:function(t){return this.annotations.push(t),this.plot.redraw(),this.annotations.length},clear_annotations:function(){this.annotations=[],this.plot.redraw()},refresh:function(t){if(this.options.display){var o=this.plot._Mx,s=t.getContext("2d"),n=this;s.save(),s.beginPath(),s.rect(o.l,o.t,o.r-o.l,o.b-o.t),s.clip(),i.onCanvas(o,t,function(){for(var t=n.annotations.length-1;t>=0;t--){var l=n.annotations[t],h=e,a=e;l.absolute_placement&&(h=l.x,a=l.y),l.pxl_x!==e&&(h=l.pxl_x),l.pxl_y!==e&&(a=l.pxl_y);var r=i.real_to_pixel(o,l.x,l.y);h===e&&(h=r.x),a===e&&(a=r.y),i.inrect(h,a,o.l,o.t,o.r-o.l,o.b-o.t)&&(l.value instanceof HTMLImageElement||l.value instanceof HTMLCanvasElement||l.value instanceof HTMLVideoElement?(l.width=l.value.width,l.height=l.value.height,s.drawImage(l.value,h-l.width/2,a-l.height/2)):(s.font=l.font||"bold italic 20px new century schoolbook",s.fillStyle=l.highlight?l.highlight_color||o.hi:l.color||o.fg,s.globalAlpha=1,l.width=s.measureText(l.value).width,l.height=s.measureText("M").width,s.textBaseline=l.textBaseline||n.options.textBaseline,s.textAlign=l.textAlign||n.options.textAlign,s.fillText(l.value,h,a)),l.highlight&&l.popup&&i.render_message_box(o,l.popup,h+5,a+5,l.popupTextColor))}}),s.restore()}},dispose:function(){this.annotations=this.plot=e}}}(window.sigplot=window.sigplot||{},mx,m),function(t,i,o,e){t.SliderPlugin=function(t){this.options=t!==e?t:{},this.options.display===e&&(this.options.display=!0),this.options.style===e&&(this.options.style={}),this.options.direction===e&&(this.options.direction="vertical"),this.paired_slider=this.location=this.position=e},t.SliderPlugin.prototype={init:function(t){this.plot=t;var o=t._Mx,s=this;this.onmousemove=function(t){if(s.location!==e&&!s.options.prevent_drag)if(t.xpos<o.l||t.xpos>o.r)s.set_highlight(!1);else if(t.ypos>o.b||t.ypos<o.t)s.set_highlight(!1);else{var n=s.options.style.lineWidth!==e?s.options.style.lineWidth:1;s.dragging?(n=i.pixel_to_real(o,t.xpos,t.ypos),"vertical"===s.options.direction?(s.location=t.xpos,s.position=n.x):"horizontal"===s.options.direction?(s.location=t.ypos,s.position=n.y):"both"===s.options.direction&&(s.location.x=t.xpos,s.position.x=n.x,s.location.y=t.ypos,s.position.y=n.y),s.plot.redraw(),t.preventDefault()):o.warpbox||("vertical"===s.options.direction?Math.abs(s.location-t.xpos)<n+5?s.set_highlight(!0):s.set_highlight(!1):"horizontal"===s.options.direction?Math.abs(s.location-t.ypos)<n+5?s.set_highlight(!0):s.set_highlight(!1):"both"===s.options.direction&&(Math.abs(s.location.x-t.xpos)<n+5&&Math.abs(s.location.y-t.ypos)<n+5?s.set_highlight(!0):s.set_highlight(!1)))}},this.plot.addListener("mmove",this.onmousemove),this.onmousedown=function(t){if(s.location!==e&&!(s.options.prevent_drag||t.xpos<o.l||t.xpos>o.r||t.ypos>o.b||t.ypos<o.t||t.slider_drag)){var i=s.options.style.lineWidth!==e?s.options.style.lineWidth:1;"vertical"===s.options.direction?Math.abs(s.location-t.xpos)<i+5&&(s.dragging=!0,t.slider_drag=!0,t.preventDefault()):"horizontal"===s.options.direction?Math.abs(s.location-t.ypos)<i+5&&(s.dragging=!0,t.slider_drag=!0,t.preventDefault()):"both"===s.options.direction&&Math.abs(s.location.x-t.xpos)<i+5&&Math.abs(s.location.y-t.ypos)<i+5&&(s.dragging=!0,t.slider_drag=!0,t.preventDefault())}},this.plot.addListener("mdown",this.onmousedown),this.onmouseup=function(t){s.dragging&&(s.dragging=!1,t=document.createEvent("Event"),t.source=s,t.initEvent("slidertag",!0,!0),"both"===s.options.direction?(t.location=s.location?JSON.parse(JSON.stringify(s.location)):e,t.position=s.position?JSON.parse(JSON.stringify(s.position)):e):(t.location=s.location,t.position=s.position),i.dispatchEvent(o,t),t=document.createEvent("Event"),t.initEvent("sliderdrag",!0,!0),"both"===s.options.direction?(t.location=s.location?JSON.parse(JSON.stringify(s.location)):e,t.position=s.position?JSON.parse(JSON.stringify(s.position)):e):(t.location=s.location,t.position=s.position),i.dispatchEvent(o,t))},document.addEventListener("mouseup",this.onmouseup,!1)},addListener:function(t,o){var e=this;i.addEventListener(this.plot._Mx,t,function(t){return t.source===e?o(t):void 0},!1)},removeListener:function(t,o){i.removeEventListener(this.plot._Mx,t,o,!1)},pair:function(t){if(t){if(t.direction!==this.direction)throw"paired sliders must use the same direction setting";this.paired_slider=t}else this.paired_slider=null},set_highlight:function(t){t!==this.highlight&&(this.highlight=t,this.plot.redraw())},set_position:function(t){if(!this.dragging){if("both"===this.options.direction){if(this.position!==e&&this.position.x===t.x&&this.position.y===t.y)return}else if(this.position===t)return;this.set_highlight(!1);var o=this.plot._Mx;this.position="both"===this.options.direction?t?JSON.parse(JSON.stringify(t)):e:t,t="both"===this.options.direction?i.real_to_pixel(o,this.position.x,this.position.y):i.real_to_pixel(o,this.position,this.position),"vertical"===this.options.direction?this.location=t.x:"horizontal"===this.options.direction?this.location=t.y:"both"===this.options.direction&&(this.location={x:t.x,y:t.y}),t=document.createEvent("Event"),t.initEvent("slidertag",!0,!0),"both"===this.options.direction?(t.location=this.location?JSON.parse(JSON.stringify(this.location)):e,t.position=this.position?JSON.parse(JSON.stringify(this.position)):e):(t.location=this.location,t.position=this.position),i.dispatchEvent(o,t),this.plot.redraw()}},set_location:function(t){if(!this.dragging){if("both"===this.options.direction){if(this.location!==e&&this.location.x===t.x&&this.location.y===t.y)return}else if(this.location===t)return;this.set_highlight(!1);var o=this.plot._Mx;this.location="both"===this.options.direction?t?JSON.parse(JSON.stringify(t)):e:t,t="both"===this.options.direction?i.pixel_to_real(o,t.x,t.y):i.pixel_to_real(o,t,t),"vertical"===this.options.direction?this.position=t.x:"horizontal"===this.options.direction?this.position=t.y:"both"===this.options.direction&&(this.position={x:t.x,y:t.y}),t=document.createEvent("Event"),t.initEvent("slidertag",!0,!0),"both"===this.options.direction?(t.location=this.location?JSON.parse(JSON.stringify(this.location)):e,t.position=this.position?JSON.parse(JSON.stringify(this.position)):e):(t.location=this.location,t.position=this.position),i.dispatchEvent(o,t),this.plot.redraw()}},get_position:function(){return this.position},get_location:function(){return this.location},refresh:function(t){if(this.options.display&&this.position!==e){var o=this.plot._Mx;t=t.getContext("2d"),t.lineWidth=this.options.style.lineWidth!==e?this.options.style.lineWidth:1,t.lineCap=this.options.style.lineCap!==e?this.options.style.lineCap:"square",t.strokeStyle=this.options.style.strokeStyle!==e?this.options.style.strokeStyle:o.fg,(this.dragging||this.highlight)&&(t.lineWidth=Math.ceil(1.2*t.lineWidth));var s;if(s="both"===this.options.direction?i.real_to_pixel(o,this.position.x,this.position.y):i.real_to_pixel(o,this.position,this.position),"vertical"===this.options.direction){if(s.x<o.l||s.x>o.r)return;this.location=s.x}else if("horizontal"===this.options.direction){if(s.y<o.t||s.y>o.b)return;this.location=s.y}else if("both"===this.options.direction){if(s.x<o.l||s.x>o.r||s.y<o.t||s.y>o.b)return;this.location.x=s.x,this.location.y=s.y}if("vertical"===this.options.direction?(t.beginPath(),t.moveTo(this.location+.5,o.t),t.lineTo(this.location+.5,o.b),t.stroke()):"horizontal"===this.options.direction?(t.beginPath(),t.moveTo(o.l,this.location+.5),t.lineTo(o.r,this.location+.5),t.stroke()):"both"===this.options.direction&&(t.beginPath(),t.moveTo(o.l,this.location.y+.5),t.lineTo(o.r,this.location.y+.5),t.closePath(),t.moveTo(this.location.x+.5,o.t),t.lineTo(this.location.x+.5,o.b),t.stroke()),this.dragging||this.highlight){if("vertical"===this.options.direction){t.textBaseline="alphabetic",t.textAlign="left",t.fillStyle=this.options.style.textStyle!==e?this.options.style.textStyle:o.fg,t.font=o.font.font,s=i.format_g(this.position,6,3,!0).trim();var n=t.measureText(s).width;this.location+5+n>o.r?(t.textAlign="right",t.fillText(s,this.location-5,o.t+10)):t.fillText(s,this.location+5,o.t+10)}else"horizontal"===this.options.direction&&(t.textBaseline="alphabetic",t.textAlign="left",t.fillStyle=this.options.style.textStyle!==e?this.options.style.textStyle:o.fg,t.font=o.font.font,s=i.format_g(this.position,6,3,!0).trim(),this.location-o.text_h-5>o.t?t.fillText(s,o.l+10,this.location-5):t.fillText(s,o.l+10,this.location+5+o.text_h));if(this.paired_slider)if("vertical"===this.options.direction){s=this.position-this.paired_slider.position;var n=this.location-this.paired_slider.location,l=o.t+Math.round((o.b-o.t)/2);i.textline(o,this.location,l,this.paired_slider.location,l,{mode:"dashed",on:3,off:3}),t.textBaseline="alphabetic",t.textAlign="center",t.fillStyle=this.options.style.textStyle!==e?this.options.style.textStyle:o.fg,t.font=o.font.font,s=i.format_g(s,6,3,!0),t.fillText(s,this.location-Math.round(n/2),l-5)}else"horizontal"===this.options.direction&&(s=this.position-this.paired_slider.position,n=this.location-this.paired_slider.location,l=o.l+Math.round((o.r-o.l)/2),i.textline(o,l,this.location,l,this.paired_slider.location,{mode:"dashed",on:3,off:3}),t.textBaseline="alphabetic",t.textAlign="left",t.fillStyle=this.options.style.textStyle!==e?this.options.style.textStyle:o.fg,t.font=o.font.font,s=i.format_g(s,6,3,!0),t.fillText(s,l+5,this.location-Math.round(n/2)))}}},dispose:function(){this.plot.removeListener("mmove",this.onmousemove),document.removeEventListener("mouseup",this.onmouseup,!1),this.position=this.plot=e}}}(window.sigplot=window.sigplot||{},mx,m),function(t,i,o,e){t.AccordionPlugin=function(t){this.options=t!==e?t:{},this.options.display===e&&(this.options.display=!0),this.options.center_line_style===e&&(this.options.center_line_style={}),this.options.edge_line_style===e&&(this.options.edge_line_style={}),this.options.fill_style===e&&(this.options.fill_style={}),this.options.direction===e&&(this.options.direction="vertical"),this.options.mode===e&&(this.options.mode="absolute"),this.loc_2=this.loc_1=this.center_location=this.width=this.center=e,this.visible=!0},t.AccordionPlugin.prototype={init:function(t){this.plot=t;var o=this.plot._Mx,s=this;this.onmousemove=function(t){if(s.center_location!==e&&!s.options.prevent_drag)if(t.xpos<o.l||t.xpos>o.r)s.set_highlight(!1);else if(t.ypos>o.b||t.ypos<o.t)s.set_highlight(!1);else{var n=s.options.center_line_style.lineWidth!==e?s.options.center_line_style.lineWidth:1,l=s.options.edge_line_style.lineWidth!==e?s.options.edge_line_style.lineWidth:1;s.dragging||s.edge_dragging?(s.dragging&&(n=i.pixel_to_real(o,t.xpos,t.ypos),"vertical"===s.options.direction?(s.center_location=t.xpos,"absolute"===s.options.mode?s.center=n.x:"relative"===s.options.mode&&(s.center=(t.xpos-o.l)/(o.r-o.l))):"horizontal"===s.options.direction&&(s.center_location=t.ypos,"absolute"===s.options.mode?s.center=n.y:"relative"===s.options.mode&&(s.center=(t.ypos-o.t)/(o.b-o.t)))),s.edge_dragging&&(n=i.pixel_to_real(o,t.xpos,t.ypos),"vertical"===s.options.direction?"absolute"===s.options.mode?s.width=2*Math.abs(s.center-n.x):"relative"===s.options.mode&&(s.width=2*Math.abs(s.center_location-t.xpos)/(o.r-o.l)):"horizontal"===s.options.direction&&("absolute"===s.options.mode?s.width=2*Math.abs(s.center-n.y):"relative"===s.options.mode&&(s.width=2*Math.abs(s.center_location-t.ypos)/(o.b-o.t)))),s.plot&&s.plot.refresh(),t.preventDefault()):o.warpbox||("vertical"===s.options.direction?(Math.abs(s.center_location-t.xpos)<n+5?s.set_highlight(!0):s.set_highlight(!1),Math.abs(s.loc_1-t.xpos)<l+5||Math.abs(s.loc_2-t.xpos)<l+5?s.set_edge_highlight(!0):s.set_edge_highlight(!1)):"horizontal"===s.options.direction&&(Math.abs(s.center_location-t.ypos)<n+5?s.set_highlight(!0):s.set_highlight(!1),Math.abs(s.loc_1-t.ypos)<l+5||Math.abs(s.loc_2-t.ypos)<l+5?s.set_edge_highlight(!0):s.set_edge_highlight(!1)))}},this.plot.addListener("mmove",this.onmousemove),this.onmousedown=function(t){if(s.center_location!==e&&!(t.xpos<o.l||t.xpos>o.r||t.ypos>o.b||t.ypos<o.t)){var i=s.options.center_line_style.lineWidth!==e?s.options.center_line_style.lineWidth:1,n=s.options.edge_line_style.lineWidth!==e?s.options.edge_line_style.lineWidth:1;"vertical"===s.options.direction?Math.abs(s.loc_1-t.xpos)<n+5||Math.abs(s.loc_2-t.xpos)<n+5?(s.edge_dragging=!0,t.preventDefault()):Math.abs(s.center_location-t.xpos)<i+5&&(s.dragging=!0,t.preventDefault()):"horizontal"===s.options.direction&&(Math.abs(s.loc_1-t.ypos)<n+5||Math.abs(s.loc_2-t.ypos)<n+5?(s.edge_dragging=!0,t.preventDefault()):Math.abs(s.center_location-t.ypos)<i+5&&(s.dragging=!0,t.preventDefault()))}},this.plot.addListener("mdown",this.onmousedown),this.onmouseup=function(t){s.dragging=!1,s.edge_dragging=!1,t=document.createEvent("Event"),t.initEvent("accordiontag",!0,!0),t.center=s.center,t.width=s.width,i.dispatchEvent(o,t)},document.addEventListener("mouseup",this.onmouseup,!1)},addListener:function(t,o){i.addEventListener(this.plot._Mx,t,o,!1)},removeListener:function(t,o){i.removeEventListener(this.plot._Mx,t,o,!1)},set_highlight:function(t){t!==this.highlight&&(this.highlight=t,this.plot.redraw())},set_edge_highlight:function(t){t!==this.edge_highlight&&(this.edge_highlight=t,this.plot.redraw())},set_center:function(t){if(this.center=t,this.plot){t=this.plot._Mx;var o=document.createEvent("Event");o.initEvent("accordiontag",!0,!0),o.center=this.center,o.width=this.width,i.dispatchEvent(t,o),this.plot.redraw()}},set_width:function(t){if(this.width=t,this.plot){t=this.plot._Mx;var o=document.createEvent("Event");o.initEvent("accordiontag",!0,!0),o.center=this.center,o.width=this.width,i.dispatchEvent(t,o),this.plot.redraw()}},get_center:function(){return this.center},get_width:function(){return this.width},refresh:function(t){if(this.plot&&this.visible&&this.options.display&&this.center!==e&&this.width!==e){var o=this.plot._Mx,s=t.getContext("2d");s.clearRect(0,0,t.width,t.height);var n;"absolute"===this.options.mode?n=i.real_to_pixel(o,this.center,this.center):"relative"===this.options.mode&&("vertical"===this.options.direction?(n=o.stk[0].x1+(o.stk[0].x2-o.stk[0].x1)*this.center,n=i.real_to_pixel(o,i.pixel_to_real(o,n,n).x,i.pixel_to_real(o,n,n).y)):"horizontal"===this.options.direction&&(n=o.stk[0].y1+(o.stk[0].y2-o.stk[0].y1)*this.center,n=i.real_to_pixel(o,i.pixel_to_real(o,n,n).x,i.pixel_to_real(o,n,n).y)));var l,h;"absolute"===this.options.mode?(l=i.real_to_pixel(o,this.center-this.width/2,this.center-this.width/2),h=i.real_to_pixel(o,this.center+this.width/2,this.center+this.width/2)):"relative"===this.options.mode&&(h=o.stk[0].x2-o.stk[0].x1,t=o.stk[0].y2-o.stk[0].y1,l={x:n.x-this.width*h/2,y:n.y-this.width*t/2},h={x:n.x+this.width*h/2,y:n.y+this.width*t/2}),"vertical"===this.options.direction?(this.center_location=n.x,this.loc_1=Math.max(o.l,l.x),this.loc_2=Math.min(o.r,h.x)):"horizontal"===this.options.direction&&(this.center_location=n.y,this.loc_1=Math.max(o.t,h.y),this.loc_2=Math.min(o.b,l.y)),this.options.shade_area&&0<Math.abs(this.loc_2-this.loc_1)&&(l=s.globalAlpha,s.globalAlpha=this.options.fill_style.opacity!==e?this.options.fill_style.opacity:.4,s.fillStyle=this.options.fill_style.fillStyle!==e?this.options.fill_style.fillStyle:o.hi,"vertical"===this.options.direction?s.fillRect(this.loc_1,o.t,this.loc_2-this.loc_1,o.b-o.t):"horizontal"===this.options.direction&&s.fillRect(o.l,this.loc_1,o.r-o.l,this.loc_2-this.loc_1),s.globalAlpha=l),(this.options.draw_edge_lines||this.edge_highlight||this.edge_dragging)&&(s.lineWidth=this.options.edge_line_style.lineWidth!==e?this.options.edge_line_style.lineWidth:1,s.lineCap=this.options.edge_line_style.lineCap!==e?this.options.edge_line_style.lineCap:"square",s.strokeStyle=this.options.edge_line_style.strokeStyle!==e?this.options.edge_line_style.strokeStyle:o.fg,(this.edge_dragging||this.edge_highlight)&&(s.lineWidth=Math.ceil(1.2*s.lineWidth)),"vertical"===this.options.direction?(s.beginPath(),s.moveTo(this.loc_1+.5,o.t),s.lineTo(this.loc_1+.5,o.b),s.stroke(),s.beginPath(),s.moveTo(this.loc_2+.5,o.t),s.lineTo(this.loc_2+.5,o.b),s.stroke()):"horizontal"===this.options.direction&&(s.beginPath(),s.moveTo(o.l,this.loc_1+.5),s.lineTo(o.r,this.loc_1+.5),s.stroke(),s.beginPath(),s.moveTo(o.l,this.loc_2+.5),s.lineTo(o.r,this.loc_2+.5),s.stroke())),this.options.draw_center_line&&(s.lineWidth=this.options.center_line_style.lineWidth!==e?this.options.center_line_style.lineWidth:1,s.lineCap=this.options.center_line_style.lineCap!==e?this.options.center_line_style.lineCap:"square",s.strokeStyle=this.options.center_line_style.strokeStyle!==e?this.options.center_line_style.strokeStyle:o.fg,(this.dragging||this.highlight)&&(s.lineWidth=Math.ceil(1.2*s.lineWidth)),"vertical"===this.options.direction?(s.beginPath(),s.moveTo(this.center_location+.5,o.t),s.lineTo(this.center_location+.5,o.b),s.stroke()):"horizontal"===this.options.direction&&(s.beginPath(),s.moveTo(o.l,this.center_location+.5),s.lineTo(o.r,this.center_location+.5),s.stroke()))}},set_visible:function(t){this.visible=t,this.plot.redraw()},set_mode:function(t){this.options.mode=t},dispose:function(){this.width=this.center_location=this.center=this.plot=e}}}(window.sigplot=window.sigplot||{},mx,m),function(t,i,o,e){t.BoxesPlugin=function(t){this.options=t===e?{}:t,this.options.display===e&&(this.options.display=!0),this.boxes=[]},t.BoxesPlugin.prototype={init:function(t){this.plot=t},menu:function(){var t=function(t){return function(){t.options.display=!t.options.display,t.plot.redraw()}}(this),i=function(t){return function(){t.boxes=[],t.plot.redraw()}}(this);return{text:"Boxes...",menu:{title:"BOXES",items:[{text:"Display",checked:this.options.display,style:"checkbox",handler:t},{text:"Clear All",handler:i}]}}},add_box:function(t){return this.boxes.push(t),this.plot.redraw(),this.boxes.length},clear_boxes:function(){this.boxes=[],this.plot.redraw()},refresh:function(t){if(this.options.display){var o=this.plot._Mx;t=t.getContext("2d");var e,s,n,l,h,a;t.save(),t.beginPath(),t.rect(o.l,o.t,o.r-o.l,o.b-o.t),t.clip();for(var r=0;r<this.boxes.length;r++)e=this.boxes[r],!0===e.absolute_placement?(s=e.x+o.l,n=e.y+o.t,l=e.w,h=e.h):(h=i.real_to_pixel(o,e.x,e.y),a=i.real_to_pixel(o,e.x+e.w,e.y+e.h),s=h.x,n=h.y,l=a.x-h.x,h=h.y-a.y),t.strokeStyle=e.strokeStyle||o.fg,t.lineWidth=e.lineWidth||1,1===t.lineWidth%2&&(s+=.5,n+=.5),(e.fillStyle||e.fill)&&(t.globalAlpha=e.alpha||.5,t.fillStyle=e.fillStyle||t.strokeStyle,t.fillRect(s,n,l,h),t.globalAlpha=1),t.strokeRect(s,n,l,h),e.text&&(t.save(),t.font=e.font||o.text_H+"px Courier New, monospace",t.globalAlpha=1,t.textAlign="end",t.fillStyle=t.strokeStyle,e.font&&(t.font=e.font),s-=o.text_w,n-=o.text_h/3,h=t.measureText(e.text).width,s-h<o.l&&(s+=l),t.fillText(e.text,s,n),t.restore());t.restore()}},dispose:function(){this.plot=e,this.boxes=[]}}}(window.sigplot=window.sigplot||{},mx,m),function(t,i,o,e){t.PlaybackControlsPlugin=function(t){this.options=t===e?{}:t,this.options.display===e&&(this.options.display=!0),this.options.size=this.options.size||25,this.options.lineWidth=this.options.lineWidth||2,this.state="paused",this.highlight=!1},t.PlaybackControlsPlugin.prototype={init:function(t){this.plot=t;var i=this,o=this.plot._Mx;this.onmousemove=function(t){o.warpbox||(i.ismouseover(t.xpos,t.ypos)?i.set_highlight(!0):i.set_highlight(!1))},this.plot.addListener("mmove",this.onmousemove),this.onmousedown=function(t){o.warpbox||i.ismouseover(t.xpos,t.ypos)&&t.preventDefault()},this.plot.addListener("mdown",this.onmousedown),this.onmouseclick=function(t){!o.warpbox&&i.ismouseover(t.xpos,t.ypos)&&(i.toggle(),t.preventDefault())},this.plot.addListener("mclick",this.onmouseclick)},set_highlight:function(t){t!==this.highlight&&(this.highlight=t,this.plot.redraw())},toggle:function(t){if(t||(t="paused"===this.state?"playing":"paused"),t!==this.state&&this.plot){var o=this.plot._Mx,e=document.createEvent("Event");e.initEvent("playbackevt",!0,!0),e.state=t,i.dispatchEvent(o,e)&&(this.state=t),this.plot.redraw()}},addListener:function(t,o){i.addEventListener(this.plot._Mx,t,o,!1)},removeListener:function(t,o){i.removeEventListener(this.plot._Mx,t,o,!1)},ismouseover:function(t,i){var o=this.position();return Math.pow(t-o.x,2)+Math.pow(i-o.y,2)<Math.pow(this.options.size/2,2)},position:function(){if(this.options.position)return this.options.position;if(this.plot){var t=this.plot._Mx,i=this.options.size/2;return{x:t.l+i+this.options.lineWidth+1,y:t.t+i+this.options.lineWidth+1}}return{x:null,y:null}},refresh:function(t){var i,o,e;if(this.options.display){var s=this.plot._Mx,n=t.getContext("2d");n.lineWidth=this.options.lineWidth;var l=this.options.size/2;this.highlight&&(n.lineWidth+=2,l+=1);var h=this.position();if(n.beginPath(),n.arc(h.x,h.y,l-n.lineWidth,0,2*Math.PI,!0),n.closePath(),n.strokeStyle=this.options.strokeStyle||s.fg,n.stroke(),this.options.fillStyle&&(n.fillStyle=this.options.fillStyle,n.fill()),"paused"===this.state){var a;o=.8*l+(h.x-l),t=1.45*l+(h.x-l),a=.8*l+(h.x-l),e=.56*l+(h.y-l),i=l+(h.y-l),l=1.45*l+(h.y-l),n.beginPath(),n.moveTo(o,e),n.lineTo(t,i),n.lineTo(a,l),n.closePath(),n.fillStyle=this.options.strokeStyle||s.fg,n.fill()}else n.lineCap="round",n.lineWidth=Math.floor(Math.min(1,this.options.size/8)),o=.8*l+(h.x-l),t=.8*l+(h.x-l),e=l/2+(h.y-l),i=1.5*l+(h.y-l),n.beginPath(),n.moveTo(o,e),n.lineTo(t,i),n.closePath(),n.stroke(),o=l+l/5+(h.x-l),t=l+l/5+(h.x-l),e=l/2+(h.y-l),i=1.5*l+(h.y-l),n.beginPath(),n.moveTo(o,e),n.lineTo(t,i),n.closePath(),n.stroke();n.restore()}},dispose:function(){this.boxes=this.plot=e}}}(window.sigplot=window.sigplot||{},mx,m);