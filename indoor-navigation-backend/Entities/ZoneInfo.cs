using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace indoor_navigation_backend.Entities
{
    public class ZoneInfo
    {
        public int id { get; set; }
        public Nullable<double> latitude { get; set; }
        public Nullable<double> longitude { get; set; }
        public Nullable<double> radius { get; set; }
        public Nullable<System.DateTime> createdAt { get; set; }
        public Nullable<System.DateTime> updatedAt { get; set; }
    }
}