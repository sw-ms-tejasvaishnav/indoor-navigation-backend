using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace indoor_navigation_backend.Entities
{
    public class RectangleInfo
    {
        public int id { get; set; }
        public double northEastLatitude { get; set; }
        public double northEastLongitude { get; set; }
        public double southWestLatitude { get; set; }
        public double southWestLongitude { get; set; }
    }
}