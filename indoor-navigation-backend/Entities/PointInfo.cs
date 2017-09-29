using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace indoor_navigation_backend.Entities
{
    public class PointInfo
    {
        public int id { get; set; }
        public string annotation { get; set; }
        public Nullable<int> buildingId { get; set; }
        public string category { get; set; }
        public Nullable<System.DateTime> createdAt { get; set; }
        public string customIconImageUrl { get; set; }
        public string description { get; set; }
        public Nullable<int> externalId { get; set; }
        public Nullable<int> floorId { get; set; }
        public string imageUrl { get; set; }
        public Nullable<bool> isAccessible { get; set; }
        public Nullable<bool> isActive { get; set; }
        public Nullable<bool> isExit { get; set; }
        public Nullable<int> level { get; set; }
        public Nullable<double> latitude { get; set; }
        public Nullable<double> longitude { get; set; }
        public Nullable<int> maxZoomLevel { get; set; }
        public string name { get; set; }
        public Nullable<int> poiType { get; set; }
        public Nullable<int> portalId { get; set; }
        public Nullable<System.DateTime> updatedAt { get; set; }
        public Nullable<int> x { get; set; }
        public Nullable<int> y { get; set; }
        public Nullable<int> zoomLevel { get; set; }
        public LocationInfo location { get; set; }
        
    }
}