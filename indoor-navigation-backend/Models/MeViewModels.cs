using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace indoor_navigation_backend.Models
{
    // Models returned by MeController actions.
    public class GetViewModel
    {
        public string Hometown { get; set; }
    }
}