using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace indoor_navigation_backend.Entities
{
    public class LocationInfo
    {
        public Nullable<double> latitude { get; set; }
        public Nullable<double> longitude { get; set; }
    }
}