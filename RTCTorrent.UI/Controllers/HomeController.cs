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
            var torrents = new List<TorrentModel>();
            // TODO: This is an example, list from uploaded torrents
            const string id = "6D80D046-6E45-4DBE-97D5-541FBCBB2E78";
            var files = new List<string>
            {
                "practical-performance-profiling-webinar.wmv"
            };
            var torrent = new TorrentModel
            {
                Id = id,
                Name = "Practical Performance Profiling Webinar",
                Files = files,
                Leechers = TorrentHub.Instance.Torrents.ContainsKey(id) ? TorrentHub.Instance.Torrents[id].Item1.Count : 0,
                Seeders = TorrentHub.Instance.Torrents.ContainsKey(id) ? TorrentHub.Instance.Torrents[id].Item2.Count : 0,
                Size = 1000000,
            };
            torrents.Add(torrent);
            return View(torrents);
        }
    }
}
