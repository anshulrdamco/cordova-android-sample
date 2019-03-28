// Start : Content Models
var MapOverlayContent = (function () {
    var Rotation = function () {
        var self = this;
        self.Angle = ko.observable(0);
        self.CenterX = ko.observable(0);
        self.CenterY = ko.observable(0);

        self.Clone = function () {
            var rotation = new Rotation();
            rotation.Angle(self.Angle());
            rotation.CenterX(self.CenterX());
            rotation.CenterY(self.CenterY());
            return rotation;
        }

        self.Print = function (reverseAngle) {
            return (self.Angle() - (reverseAngle||0)) + ',' + self.CenterX() + ',' + self.CenterY();
		}
	}

	var MapOverlayContentLabel = function () {
		var self = this;
		self.Text = ko.observable();
		self.CssClass = ko.observable("");
		self.Position = ko.observable(new Point(0, 0));

		self.LoadFromObject = function (label) {
			if (label) {
				self.Text(label.Text);
				self.CssClass(label.CssClass);
				self.Position(new Point(label.Position.X, label.Position.Y));
			}
		}
	}

	var MapOverlayContentIcon = function () {
		var self = this;
		self.Name = ko.observable();
		self.Svg = ko.observable();
		self.Url = ko.observable();
		self.CssClass = ko.observable("");
		self.Position = ko.observable(new Point(0, 0));
		self.Rotation = ko.observable(new Rotation());
		self.Scale = ko.observable(1);
		self.IsChecked = ko.observable(false);

		self.LoadFromObject = function (icon) {
			if (icon) {
				self.Name(icon.Name);
				if (icon.Svg) {
					self.Svg(icon.Svg);
				}
				self.Url(icon.Url);
				self.CssClass(icon.CssClass);
				self.Position(new Point(icon.Position.X, icon.Position.Y));

				var rotation = new Rotation();
				rotation.Angle(icon.Rotation.Angle);
				rotation.CenterX(icon.Rotation.CenterX);
				rotation.CenterY(icon.Rotation.CenterY);

				self.Rotation(rotation);
				self.Scale(icon.Scale);
				self.IsChecked(icon.IsChecked);
			}
		}
	}

	var MapOverlayContentArtifact = function () {
		var self = this;
		self.Name = ko.observable();
		self.Url = ko.observable();
		self.Description = ko.observable();
		self.IsChecked = ko.observable(false);

		self.LoadFromObject = function (artifact) {
			if (artifact) {
				self.Name(artifact.Name);
				self.Url(artifact.Url);
				self.Description(artifact.Description);
				if (artifact.Position) {
					self.Position(new Point(artifact.Position.X, artifact.Position.Y));
				}
				self.IsChecked(artifact.IsChecked);
			}
		}
	}

	var MapOverlayContent = function () {
		var self = this;

		self.Id = ko.observable();
		self.Label = ko.observable(new MapOverlayContentLabel());
		self.Icon = ko.observable(new MapOverlayContentIcon());
		self.Artifacts = ko.observableArray([]);
		self.CssClass = ko.observable("");
		self.Position = ko.observable(new Point(0, 0));
		self.Rotation = ko.observable(new Rotation());
		self.Scale = ko.observable(1);
		self.IsDirty = ko.observable(true);

		self.IsAritifactIconVisible = ko.computed(function () {
			return !!(self.Artifacts().length > 0
                && !(
                    (self.Label().Text() && self.Label().Text().length > 0)
                    || (self.Icon().Svg() && self.Icon().Svg().length > 0)
                ));
		});

		self.LoadFromObject = function (content) {
			self.Id(content.Id);
			self.IsDirty = ko.observable(false);
			self.Label().LoadFromObject(content.Label);
			self.Icon().LoadFromObject(content.Icon);
			$.each(content.Artifacts, function (index, artifact) {
				var art = new MapOverlayContentArtifact();
				art.LoadFromObject(artifact);
				self.Artifacts.push(artifact);
			});
			self.CssClass(content.CssClass);
			self.Position(new Point(content.Position.X, content.Position.Y));

			var rotation = new Rotation();
			rotation.Angle(content.Rotation.Angle);
			rotation.CenterX(content.Rotation.CenterX);
			rotation.CenterY(content.Rotation.CenterY);

			self.Rotation(rotation);
			self.Scale(content.Scale);
		};
	}

	return MapOverlayContent;
})();
// End : Content Models
