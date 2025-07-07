const express = require('express')
const router = express.Router()
const JwtMiddleware = require('../config/Jwt-Middleware')
const sequelize = require('../config/db-instance')
const { QueryTypes } = require('sequelize');

//  @route                  GET  /api/v2/geosalt/all
//  @desc                   list all geosalts
//  @access                 Private
router.get('/list/all', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get geosalt list all API called')
  try {
    const geosaltFound = await sequelize.query(`
    SELECT json_build_object(
      'type', 'FeatureCollection',
      'crs',  json_build_object(
          'type',      'name', 
          'properties', json_build_object(
              'name', 'EPSG:4326'  
          )
      ), 
      'features', json_agg(
          json_build_object(
              'type',       'Feature',
              'id',         'ogc_fid',
              'geometry',   ST_AsGeoJSON(wkb_geometry)::json,
              'properties', json_build_object(
                -- list of fields
                'FID', fid,
                'Legend', legend,
                'ID', id,
                'Area', area,
                'Area_rai', area_rai
              )
            )
          )
        )
        FROM salt_esan_clip;
    `, {
        type: QueryTypes.SELECT,
      }); 
      if (geosaltFound) {
        // console.log('geosaltFound in map', geosaltFound)
        console.log('geosaltFound in map')
        res.status(200).json({
          status: 'ok',
          result: geosaltFound[0].json_build_object,
        })
      } else {
        res.status(500).json({
          status: 'nok',
        })
      } 

    } catch (error) {
      res.status(500).json({
        Error: error.toString(),
      })
    }  
})

//  @route                  GET  /api/v2/geosalt/list
//  @desc                   list all geosalts by Id
//  @access                 Private
router.get('/list/:id', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get geosalt list API called')
  let ID = req.params.id  || 'ANY'
  console.log('ID',ID)  
  try {
    const geosaltFound = await sequelize.query(`
    SELECT json_build_object(
      'type', 'FeatureCollection',
      'crs',  json_build_object(
          'type',      'name', 
          'properties', json_build_object(
              'name', 'EPSG:4326'  
          )
      ), 
      'features', json_agg(
          json_build_object(
              'type',       'Feature',
              'id',         'ogc_fid',
              'geometry',   ST_AsGeoJSON(wkb_geometry)::json,
              'properties', json_build_object(
                -- list of fields
                'FID', fid,
                'Legend', legend,
                'ID', id,
                'Area', area,
                'Area_rai', area_rai
              )
            )
          )
        )
        FROM salt_esan_clip
        WHERE id='${ID}';
    `, {
        type: QueryTypes.SELECT,
      }); 
      if (geosaltFound) {
        // console.log('geosaltFound in map', geosaltFound)
        console.log('geosaltFound in map')
        res.status(200).json({
          status: 'ok',
          result: geosaltFound[0].json_build_object,
        })
      } else {
        res.status(500).json({
          status: 'nok',
        })
      } 

    } catch (error) {
      res.status(500).json({
        Error: error.toString(),
      })
    }  
})


// For salt view sidebar no authentization

//  @route                  GET  /api/v2/geosalt/sidebar/list/all
//  @desc                   list all geosalts sidebar only
//  @access                 public
router.get('/sidebar/list/all', async (req, res) => {
  console.log('get geosalt list all API called')
  try {
    const geosaltFound = await sequelize.query(`
    SELECT json_build_object(
      'type', 'FeatureCollection',
      'crs',  json_build_object(
          'type',      'name', 
          'properties', json_build_object(
              'name', 'EPSG:4326'  
          )
      ), 
      'features', json_agg(
          json_build_object(
              'type',       'Feature',
              'id',         'ogc_fid',
              'geometry',   ST_AsGeoJSON(wkb_geometry)::json,
              'properties', json_build_object(
                -- list of fields
                'FID', fid,
                'Legend', legend,
                'ID', id,
                'Area', area,
                'Area_rai', area_rai
              )
            )
          )
        )
        FROM salt_esan_clip;
    `, {
        type: QueryTypes.SELECT,
      }); 
      if (geosaltFound) {
        // console.log('geosaltFound in map', geosaltFound)
        console.log('geosaltFound in map')
        res.status(200).json({
          status: 'ok',
          result: geosaltFound[0].json_build_object,
        })
      } else {
        res.status(500).json({
          status: 'nok',
        })
      } 

    } catch (error) {
      res.status(500).json({
        Error: error.toString(),
      })
    }  
})

//  @route                  GET  /api/v2/geosalt/sidebar/list
//  @desc                   list all geosalts by Id sidebar only
//  @access                 public
router.get('/sidebar/list/:id', async (req, res) => {
  console.log('get geosalt list API called')
  let ID = req.params.id  || 'ANY'
  console.log('ID',ID)  
  try {
    const geosaltFound = await sequelize.query(`
    SELECT json_build_object(
      'type', 'FeatureCollection',
      'crs',  json_build_object(
          'type',      'name', 
          'properties', json_build_object(
              'name', 'EPSG:4326'  
          )
      ), 
      'features', json_agg(
          json_build_object(
              'type',       'Feature',
              'id',         'ogc_fid',
              'geometry',   ST_AsGeoJSON(wkb_geometry)::json,
              'properties', json_build_object(
                -- list of fields
                'FID', fid,
                'Legend', legend,
                'ID', id,
                'Area', area,
                'Area_rai', area_rai
              )
            )
          )
        )
        FROM salt_esan_clip
        WHERE id='${ID}';
    `, {
        type: QueryTypes.SELECT,
      }); 
      if (geosaltFound) {
        // console.log('geosaltFound in map', geosaltFound)
        console.log('geosaltFound in map')
        res.status(200).json({
          status: 'ok',
          result: geosaltFound[0].json_build_object,
        })
      } else {
        res.status(500).json({
          status: 'nok',
        })
      } 

    } catch (error) {
      res.status(500).json({
        Error: error.toString(),
      })
    }  
})


module.exports = router
