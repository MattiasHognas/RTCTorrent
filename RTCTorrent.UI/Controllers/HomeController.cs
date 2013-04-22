using System.Collections.Generic;
using System.Web.Mvc;
using RTCTorrent.UI.Hubs;
using RTCTorrent.UI.Models;

namespace RTCTorrent.UI.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Torrents()
        {
            var torrents = new List<TorrentModel>();
            // TODO: This is an example only, add from uploaded torrents
            const string id = "6D80D046-6E45-4DBE-97D5-541FBCBB2E78";
            var files = new List<string>
            {
                "practical-performance-profiling-webinar.wmv"
            };
            var torrent = new TorrentModel
            {
                Id = id,
                Name = id,
                Files = files,
                Leechers = TorrentHub.Instance.Torrents[id].Item1.Count,
                Seeders = TorrentHub.Instance.Torrents[id].Item2.Count
            };
            torrents.Add(torrent);
            return PartialView("Torrents", torrents);
        }
    }
}
