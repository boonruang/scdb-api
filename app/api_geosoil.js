const express = require('express')
const router = express.Router()
const JwtMiddleware = require('../config/Jwt-Middleware')
const sequelize = require('../config/db-instance')
const { QueryTypes } = require('sequelize');

//  @route                  GET  /api/v2/geosoil/list/all
//  @desc                   list all geosalts
//  @access                 Private
router.get('/list/all', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get geosoil list all API called')
  try {
    const geosoilFound = await sequelize.query(`
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
                'fid', fid,
                'soilgroup', soilgroup,
                'fertility', fertility,
                'soil_serie', soil_serie,
                'ph_top', ph_top,
                'soilserien', soilserien,
                'texture_to', texture_to,
                'fid_wgs84_', fid_wgs84_,
                'amphoe_idn', amphoe_idn,	
                'amp_code', amp_code,	
                'amphoe_t', amphoe_t,	
                'amphoe_e', amphoe_e,	
                'prov_code', prov_code,	
                'prov_nam_t', prov_nam_t,	
                'prov_nam_e', prov_nam_e,	
                'p_code', p_code	
              )
            )
          )
        )
        FROM soil_mahasarakham;
    `, {
        type: QueryTypes.SELECT,
      }); 
      if (geosoilFound) {
        // console.log('geosoilFound in map', geosoilFound)
        console.log('geosoilFound in map')
        res.status(200).json({
          status: 'ok',
          result: geosoilFound[0].json_build_object,
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

//  @route                  GET  /api/v2/geosoil/list/:ampc
//  @desc                   list all geosalts by Amp_code
//  @access                 Private
router.get('/list/:ampc', JwtMiddleware.checkToken, async (req, res) => {
  console.log('get geosoil list API called')
  let AMP_CODE = req.params.ampc.toString()
  console.log('AMP_CODE',AMP_CODE)
  try {
    const geosoilFound = await sequelize.query(`
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
                'fid', fid,
                'soilgroup', soilgroup,
                'fertility', fertility,
                'soil_serie', soil_serie,
                'ph_top', ph_top,
                'soilserien', soilserien,
                'texture_to', texture_to,
                'fid_wgs84_', fid_wgs84_,
                'amphoe_idn', amphoe_idn,	
                'amp_code', amp_code,	
                'amphoe_t', amphoe_t,	
                'amphoe_e', amphoe_e,	
                'prov_code', prov_code,	
                'prov_nam_t', prov_nam_t,	
                'prov_nam_e', prov_nam_e,	
                'p_code', p_code	
              )
            )
          )
        )
        FROM soil_mahasarakham
        WHERE amp_code='${AMP_CODE}';
    `, {
        type: QueryTypes.SELECT,
      }); 
      if (geosoilFound) {
        // console.log('geosoilFound in map', geosoilFound)
        console.log('geosoilFound in map')
        res.status(200).json({
          status: 'ok',
          result: geosoilFound[0].json_build_object,
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
