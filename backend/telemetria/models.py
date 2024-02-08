from django.db import models

class Telemetria(models.Model):
    actionId = models.IntegerField(null=True, blank=True)
    actionKey = models.CharField(max_length=20, null=True, blank=True)
    anonymized = models.BooleanField(null=True, blank=True)
    data = models.CharField(max_length=200, blank=True)
    dataDuration = models.IntegerField(null=True, blank=True)
    dataId = models.IntegerField(null=True, blank=True)
    dataName = models.CharField(max_length=200, blank=True, null=True)
    dataNetId = models.IntegerField(null=True, blank=True)
    dataPrice = models.IntegerField(null=True, blank=True)
    dataSeviceId = models.IntegerField(null=True, blank=True)
    dataTsId = models.IntegerField(null=True, blank=True)
    date = models.IntegerField(null=True, blank=True)
    deviceId = models.IntegerField(null=True, blank=True)
    ip = models.GenericIPAddressField(null=True, blank=True)
    ipId = models.IntegerField(null=True, blank=True)
    manual = models.BooleanField(null=True, blank=True)
    profileId = models.IntegerField(null=True, blank=True)
    reaonId = models.IntegerField(null=True, blank=True)
    reasonKey = models.CharField(max_length=20, null=True, blank=True)
    recordId = models.IntegerField(null=True, blank=True)
    smartcardId = models.CharField(max_length=50, null=True)
    subscriberCode = models.CharField(max_length=50, null=True)
    timestamp = models.IntegerField(null=True, blank=True)
    whoisCountry = models.CharField(max_length=20, null=True, blank=True)
    whoisIsp = models.CharField(max_length=20, null=True, blank=True)

    #para poder ver el nombre el objeto en el admin
    def __str__(self):
        return self.data
