using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace indoor_navigation_backend.Entities
{
    public class SegmentInfo
    {
        public int segmentId { get; set; }
        public Nullable<int> startPointId { get; set; }
        public Nullable<int> endPointId { get; set; }
        public Nullable<int> floorId { get; set; }
        public Nullable<System.DateTime> createdAt { get; set; }
        public Nullable<System.DateTime> updatedAt { get; set; }
        public Nullable<bool> isActive { get; set; }
        public Nullable<int> externalId { get; set; }
    }
}