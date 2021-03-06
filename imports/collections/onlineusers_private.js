import { Meteor } from 'meteor/meteor';
import { OnlineUsersSchema } from './onlineusers.schema';
import moment from 'moment/moment';

if (Meteor.isServer) {
    Meteor.publish('onlineUsersForRoute', function (route) {
        return OnlineUsersSchema.find({activeRoute: route});
    });
}

const checkRouteParamAndAuthorization = (route, userId) => {
    check(route, String);
    if (!userId) {
        throw new Meteor.Error('not-authorized');
    }
};

Meteor.methods({
    'onlineUsers.enterRoute'(route) {
        const userId = Meteor.userId();
        checkRouteParamAndAuthorization(route, userId);

        OnlineUsersSchema.upsert(
            { userId: userId, activeRoute:route },
            { updatedAt: new Date() }
        );

        // remove outdated entries
        const aMinAgo = moment().add(-1,'minutes').toDate();
        OnlineUsersSchema.remove({updatedAt: {"$lt" : aMinAgo}});
    },
    'onlineUsers.leaveRoute'(route) {
        const userId = Meteor.userId();
        checkRouteParamAndAuthorization(route, userId);
        OnlineUsersSchema.remove({userId: userId, activeRoute:route});
    }
});