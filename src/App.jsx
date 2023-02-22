import React from "react";
import {
  Cartesian3,
  Cartographic,
  ScreenSpaceEventType,
  Viewer,
  Math,
  Color,
  Rectangle,
  GeoJsonDataSource,
} from "cesium";
import { useRef } from "react";
import { useEffect } from "react";
import { CESIUM_CONFIG } from "./constants/cesiumConfig";
import { modelList } from "./constants/modelList";
import { useState } from "react";
import { Pane } from "tweakpane";
import { throttle } from "lodash";

const App = () => {
  const cesiumContainer = useRef(null);

  const [location, setLocation] = useState({
    latitude: 0,
    longitude: 0,
    height: 0,
  });

  useEffect(() => {
    const viewer = new Viewer(cesiumContainer.current, CESIUM_CONFIG);
    viewer.scene.globe.depthTestAgainstTerrain = true;
    viewer.scene.screenSpaceCameraController.enableCollisionDetection = false;
    viewer.scene.globe.translucency.enabled = true;
    viewer.scene.globe.undergroundColor = undefined;
    viewer.scene.globe.translucency.frontFaceAlpha = 1;
    viewer.scene.globe.translucency.backFaceAlpha = 0;
    viewer.scene.screenSpaceCameraController.inertiaSpin = 0.1;
    viewer.scene.screenSpaceCameraController.inertiaTranslate = 0.1;
    viewer.scene.screenSpaceCameraController.inertiaZoom = 0.1;

    // 添加模型
    const models = [];
    modelList.forEach((item) => {
      const model = viewer.entities.add({
        name: item.name,
        position: Cartesian3.fromDegrees(item.positionLon, item.positionLat),
        model: {
          uri: item.uri,
          rotation: Math.toRadians(45),
        },
      });
      models.push(model);
    });
    viewer.flyTo(models.at(0));

    // 绑定鼠标移动获取坐标
    viewer.screenSpaceEventHandler.setInputAction(
      throttle((e) => {
        const cartesian = viewer.camera.pickEllipsoid(
          e.endPosition,
          viewer.scene.globe.ellipsoid
        );
        if (cartesian) {
          const cartographic = Cartographic.fromCartesian(cartesian);
          const longitude = Math.toDegrees(cartographic.longitude);
          const latitude = Math.toDegrees(cartographic.latitude);
          const height =
            viewer.camera.positionCartographic.height - cartographic.height;
          setLocation({ height, latitude, longitude });
        }
      }, 1000),
      ScreenSpaceEventType.MOUSE_MOVE
    );

    let entities;
    var promise = GeoJsonDataSource.load("Model/export.geojson", {
      clampToGround: true,
    });
    promise.then(function (dataSource) {
      var shenzhenhousevalue = viewer.dataSources.add(dataSource);
      entities = dataSource.entities.values;
      viewer.zoomTo(entities);
      for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        entity.polygon.extrudedHeight = 40;
        entity.polygon.name = entity._name;
        entity.polygon.material = Color.GAINSBORO;
        entity.polygon.outline = false;
        entity.polygon.outlineColor = Color.GAINSBORO;
      }
    });

    // 初始化面板
    const pane = new Pane();
    pane.addInput(viewer.scene.globe.translucency, "frontFaceAlpha", {
      label: "地表透明度",
      max: 1,
      min: 0,
      step: 0.1,
    });
  }, []);

  return (
    <div className="relative">
      <div ref={cesiumContainer}></div>
      <div className="w-full absolute bottom-0 left-0 bg-white flex gap-4 px-4">
        <p>
          经度：<span className="font-mono">{location.longitude}</span>
        </p>
        <p>
          纬度：<span className="font-mono">{location.latitude}</span>
        </p>
        <p>
          视角海拔：<span className="font-mono">{location.height}</span>
        </p>
      </div>
    </div>
  );
};

export default App;
