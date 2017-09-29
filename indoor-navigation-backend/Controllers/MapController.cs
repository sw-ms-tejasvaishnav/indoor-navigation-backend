using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using indoor_navigation_backend.Entities;
using System.Data.Entity;
using indoor_navigation_backend.EF;

namespace indoor_navigation_backend.Controllers
{
    public class MapController : Controller
    {
        private EF.MapEntities dbContext;

        public MapController()
        {
            dbContext = new EF.MapEntities();
        }

        // GET: Map
        public ActionResult Index()
        {
            return View();
        }

        #region Point
        [HttpGet]
        public JsonResult GetPointData()
        {
            try
            {
                var data = (from point in dbContext.Points
                            select new PointInfo
                            {
                                id = point.id,
                                annotation = point.annotation,
                                buildingId = point.buildingId,
                                category = point.category,
                                createdAt = point.createdAt,
                                customIconImageUrl = point.customIconImageUrl,
                                description = point.description,
                                externalId = point.externalId,
                                floorId = point.floorId,
                                imageUrl = point.imageUrl,
                                isAccessible = point.isAccessible,
                                isActive = point.isActive,
                                isExit = point.isExit,
                                level = point.level,
                                latitude = point.latitude,
                                longitude = point.longitude,
                                location = new LocationInfo
                                {
                                    latitude = point.latitude,
                                    longitude = point.longitude
                                },
                                maxZoomLevel = point.maxZoomLevel,
                                name = point.name,
                                poiType = point.poiType,
                                portalId = point.portalId,
                                updatedAt = point.updatedAt,
                                x = point.x,
                                y = point.y,
                                zoomLevel = point.zoomLevel
                            }).ToList();

                //if (data != null)
                //{
                //    foreach (var d in data)
                //    {
                //        var location = new LocationInfo
                //        {
                //            latitude = d.latitude,
                //            longitude = d.longitude
                //        };
                //        d.location = location;
                //    }
                //}
                return Json(data, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [HttpPost]
        public JsonResult SaveWayPoint(List<PointInfo> lstPoints)
        {
            try
            {
                foreach (var point in lstPoints)
                {
                    //return View("Index");
                    EF.Point obj = new EF.Point();
                    obj.id = point.id;
                    obj.annotation = point.annotation;
                    obj.buildingId = point.buildingId;
                    obj.category = point.category;

                    obj.customIconImageUrl = point.customIconImageUrl;
                    obj.description = point.description;
                    obj.externalId = point.externalId;
                    obj.floorId = point.floorId;
                    obj.imageUrl = point.imageUrl;
                    obj.isAccessible = point.isAccessible;
                    obj.isActive = point.isActive;
                    obj.isExit = point.isExit;
                    obj.level = point.level;
                    obj.latitude = point.latitude;
                    obj.longitude = point.longitude;
                    obj.maxZoomLevel = point.maxZoomLevel;
                    obj.name = point.name;
                    obj.poiType = point.poiType;
                    obj.portalId = point.portalId;
                    obj.x = point.x;
                    obj.y = point.y;
                    obj.zoomLevel = point.zoomLevel;
                    obj.createdAt = point.createdAt;
                    if (Convert.ToInt32(point.id) > 0)
                    {
                        obj.updatedAt = DateTime.Now;
                        var entity = GetPointById(point.id);
                        dbContext.Entry(entity).CurrentValues.SetValues(obj);
                    }
                    else
                    {
                        obj.createdAt = DateTime.Now;
                        dbContext.Points.Add(obj);
                    }
                }
                dbContext.SaveChanges();
                return GetPointData();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public Point GetPointById(int pointId)
        {
            try
            {
                return dbContext.Points.Find(pointId);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [HttpPost]
        public JsonResult DeletePoints(int[] ids)
        {
            try
            {
                foreach (int pointId in ids)
                {
                    //var d = dbContext.Points.Where(x => x.Id == pointId).FirstOrDefault();
                    //dbContext.Points.Remove(d);
                    //PointInfo pointInfo = new PointInfo{ Id = pointId };
                    var point = new Point { id = pointId };
                    dbContext.Entry(point).State = EntityState.Deleted;
                }
                dbContext.SaveChanges();
                return GetPointsWithSegments();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public JsonResult GetPointsWithSegments()
        {
            try
            {
                var data = new { points = GetPointData(), segments = GetSegmentData() };
                return Json(data, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        #region Segment
        [HttpGet]
        public JsonResult GetSegmentData()
        {
            try
            {
                var data = (from segment in dbContext.Segments
                            select segment).ToList();
                return Json(data, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [HttpPost]
        public JsonResult SaveSegment(Entities.SegmentInfo segmentData)
        {
            try
            {
                //return View("Index");
                EF.Segment obj = new EF.Segment();
                obj.startPointId = segmentData.startPointId;
                obj.endPointId = segmentData.endPointId;
                obj.floorId = segmentData.floorId;
                obj.createdAt = segmentData.createdAt;
                obj.updatedAt = segmentData.updatedAt;
                obj.isActive = segmentData.isActive;
                obj.externalId = segmentData.externalId;
                //dbContext.MapInfoes.
                dbContext.Segments.Add(obj);
                dbContext.SaveChanges();
                return GetSegmentData();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [HttpPost]
        public JsonResult DeleteSegment(int[] ids)
        {
            try
            {
                foreach (int segmentId in ids)
                {
                    var segment = new Segment { id = segmentId };
                    dbContext.Entry(segment).State = EntityState.Deleted;
                }
                dbContext.SaveChanges();
                return GetSegmentData();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        #region Zone
        [HttpGet]
        public JsonResult GetZoneData()
        {
            try
            {
                var data = (from zone in dbContext.Zones
                            select zone).ToList();
                return Json(data, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public Zone GetZoneById(int zoneId)
        {
            try
            {
                return dbContext.Zones.Find(zoneId);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [HttpPost]
        public JsonResult SaveZones(List<ZoneInfo> lstZones)
        {
            try
            {
                foreach (var zone in lstZones)
                {
                    EF.Zone obj = new EF.Zone();
                    obj.id = zone.id;
                    obj.latitude = zone.latitude;
                    obj.longitude = zone.longitude;
                    obj.radius = zone.radius;
                    obj.createdAt = zone.createdAt;
                    if (zone.id > 0)
                    {
                        obj.updatedAt = DateTime.Now;
                        var entity = GetZoneById(zone.id);
                        dbContext.Entry(entity).CurrentValues.SetValues(obj);
                    }
                    else
                    {
                        obj.createdAt = DateTime.Now;
                        dbContext.Zones.Add(obj);
                    }
                }
                dbContext.SaveChanges();
                return GetZoneData();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }


        [HttpPost]
        public JsonResult DeleteZones(int[] ids)
        {
            try
            {
                foreach (int zoneId in ids)
                {
                    var zone = new Zone { id = zoneId };
                    dbContext.Entry(zone).State = EntityState.Deleted;
                }
                dbContext.SaveChanges();
                return GetZoneData();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        #region Rectangle
        [HttpGet]
        public JsonResult GetRectangleData()
        {
            try
            {
                var data = (from rectangle in dbContext.Rectangles
                            select new
                            {
                                id = rectangle.id,
                                northEast = new LocationInfo
                                {
                                    latitude = rectangle.northEastLatitude,
                                    longitude = rectangle.northEastLongitude,
                                },
                                southWest = new LocationInfo
                                {
                                    latitude = rectangle.southWestLatitude,
                                    longitude = rectangle.southWestLongitude,
                                }
                            }).ToList();
                return Json(data, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public Rectangle GetRectangleById(int rectangleId)
        {
            try
            {
                return dbContext.Rectangles.Find(rectangleId);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [HttpPost]
        public JsonResult SaveRectangles(List<RectangleInfo> lstRectangles)
        {
            try
            {
                foreach (var rectangle in lstRectangles)
                {
                    EF.Rectangle objRectangle = new EF.Rectangle();
                    objRectangle.id = rectangle.id;
                    objRectangle.northEastLatitude = rectangle.northEastLatitude;
                    objRectangle.northEastLongitude = rectangle.northEastLongitude;
                    objRectangle.southWestLatitude = rectangle.southWestLatitude;
                    objRectangle.southWestLongitude = rectangle.southWestLongitude;
                    if (rectangle.id > 0)
                    {
                        var entity = GetRectangleById(rectangle.id);
                        dbContext.Entry(entity).CurrentValues.SetValues(objRectangle);
                    }
                    else
                    {
                        dbContext.Rectangles.Add(objRectangle);
                    }
                }
                dbContext.SaveChanges();
                return GetRectangleData();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [HttpPost]
        public JsonResult DeleteRectangles(int[] ids)
        {
            try
            {
                foreach (int rectangleId in ids)
                {
                    var rectangle = new Rectangle { id = rectangleId };
                    dbContext.Entry(rectangle).State = EntityState.Deleted;
                }
                dbContext.SaveChanges();
                return GetRectangleData();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion
    }
}